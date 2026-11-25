import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from './users.service';
import { User, AuthSession } from '../models/user.model';
import { hashPassword, generateSessionToken } from '../utils/crypto.utils';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersService = inject(UsersService);
  private router = inject(Router);

  private readonly SESSION_KEY = 'marketing_manager_session';

  // Signals reactivos para el estado de autenticación
  public currentUser = signal<User | null>(this.loadStoredSession());
  public isAuthenticated = computed(() => !!this.currentUser());
  public isAdmin = computed(() => this.currentUser()?.role === 'admin');

  /**
   * Inicia sesión validando contra usuarios de FakeStoreAPI / locales
   */
  async login(identifier: string, passwordPlain: string): Promise<{ success: boolean; user: User; message: string }> {
    const trimmedId = identifier.trim().toLowerCase();
    const cleanPass = passwordPlain.trim();

    if (!trimmedId || !cleanPass) {
      throw new Error('Por favor ingresa usuario/correo y contraseña.');
    }

    // 1. Usuario administrador local
    if ((trimmedId === 'admin' || trimmedId === 'admin@innovasoft.com') && (cleanPass === '1234' || cleanPass === 'admin123')) {
      const adminUser: User = {
        id: 999,
        username: 'admin',
        email: 'admin@innovasoft.com',
        name: { firstname: 'Administrador', lastname: 'General' },
        role: 'admin',
        phone: '81-1234-5678'
      };
      this.createSession(adminUser);
      return { success: true, user: adminUser, message: '¡Bienvenido Administrador!' };
    }

    // 2. Obtener lista de usuarios desde la API
    let users: User[] = [];
    try {
      users = await firstValueFrom(this.usersService.getUsers());
    } catch (e) {
      console.error('Error al conectar con la API de usuarios:', e);
      users = [];
    }

    // Hash de la contraseña ingresada
    const inputHash = await hashPassword(cleanPass);

    // 3. Buscar usuario por email o por username
    const foundUser = users.find(u =>
      u.email.toLowerCase() === trimmedId || u.username.toLowerCase() === trimmedId
    );

    if (!foundUser) {
      throw new Error('Usuario o correo no encontrado. Verifica tus credenciales o regístrate.');
    }

    // 4. Comparar contraseña (soporta hash SHA-256 y texto plano de la API externa)
    const matchHash = foundUser.passwordHash && foundUser.passwordHash === inputHash;
    const matchPlain = foundUser.password && foundUser.password === cleanPass;

    if (!matchHash && !matchPlain) {
      throw new Error('Contraseña incorrecta. Por favor intenta nuevamente.');
    }

    // 5. Crear y persistir sesión
    this.createSession(foundUser);
    return { success: true, user: foundUser, message: `¡Bienvenido de vuelta, ${foundUser.name.firstname}!` };
  }

  /**
   * Registro de nuevo usuario con hash de contraseña SHA-256 y correo único
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone?: string;
    city?: string;
    role?: 'admin' | 'usuario';
  }): Promise<{ success: boolean; user: User; message: string }> {
    const emailClean = data.email.trim().toLowerCase();
    const usernameClean = data.username.trim().toLowerCase();

    if (!usernameClean || !emailClean || !data.password) {
      throw new Error('Todos los campos marcados con asterisco son obligatorios.');
    }

    if (data.password.length < 6) {
      throw new Error('La contraseña debe contener al menos 6 caracteres.');
    }

    // Generar hash seguro SHA-256
    const passwordHash = await hashPassword(data.password);

    const newUserPayload: Partial<User> = {
      username: usernameClean,
      email: emailClean,
      password: data.password, // Mantiene compatibilidad con mock FakeStoreAPI
      passwordHash: passwordHash, // Hash criptográfico SHA-256
      name: {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim()
      },
      phone: data.phone?.trim() || '81-0000-0000',
      address: {
        city: data.city?.trim() || 'Córdoba',
        street: 'Principal',
        number: 1,
        zipcode: '94500',
        geolocation: { lat: '18.8942', long: '-96.9353' }
      },
      role: data.role || 'usuario'
    };

    const fallbackId = Math.floor(Math.random() * 1000) + 20;
    let apiId = fallbackId;
    try {
      const apiResponse = await firstValueFrom(this.usersService.createUser(newUserPayload));
      if (apiResponse?.id) {
        apiId = apiResponse.id;
      }
    } catch {
      // Si la API externa falla, mantenemos la sesión local con el usuario registrado
    }

    const createdUser: User = {
      id: apiId,
      email: emailClean,
      username: usernameClean,
      password: data.password,
      passwordHash: passwordHash,
      name: {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim()
      },
      phone: data.phone?.trim() || '81-0000-0000',
      address: newUserPayload.address,
      role: data.role || 'usuario'
    };

    // Iniciar sesión automáticamente
    this.createSession(createdUser);

    return {
      success: true,
      user: createdUser,
      message: 'Cuenta creada exitosamente.'
    };
  }

  /**
   * Recuperación de contraseña con token simulado
   */
  async recoverPassword(email: string): Promise<{ success: boolean; message: string; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Por favor ingresa tu correo electrónico registrado.');
    }

    let users: User[] = [];
    try {
      users = await firstValueFrom(this.usersService.getUsers());
    } catch {
      users = [];
    }

    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found && cleanEmail !== 'admin@innovasoft.com') {
      throw new Error('No existe ninguna cuenta asociada a este correo electrónico.');
    }

    // Generar token de recuperación temporal
    const recoveryToken = 'REC-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    return {
      success: true,
      token: recoveryToken,
      message: `Se ha generado un código de restablecimiento (${recoveryToken}) y enviado a ${cleanEmail}. En un entorno real recibirás un enlace de un solo uso.`
    };
  }

  /**
   * Cierra la sesión activa
   */
  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/gestion-interna'], { queryParams: { logout: 'true' } });
  }

  /**
   * Crea y guarda la sesión en localStorage
   */
  private createSession(user: User): void {
    const session: AuthSession = {
      token: generateSessionToken(user.username, user.role || 'usuario'),
      user: user,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      this.currentUser.set(user);
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  }

  /**
   * Carga la sesión desde localStorage
   */
  private loadStoredSession(): User | null {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      // Validar expiración
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        localStorage.removeItem(this.SESSION_KEY);
        return null;
      }
      return session.user;
    } catch {
      return null;
    }
  }
}
