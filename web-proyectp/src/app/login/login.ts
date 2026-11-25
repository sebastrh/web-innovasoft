import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';

import { AuthService } from '../services/auth.service';

type ActiveTab = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, Navbar],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab: ActiveTab = 'login';
  showPassword = false;
  isLoading = false;

  // Alertas visuales
  errorMessage: string | null = null;
  successMessage: string | null = null;
  infoMessage: string | null = null;

  // Modelo de Login
  loginData = {
    identifier: '',
    password: '',
    rememberMe: true
  };
  loginSubmitted = false;

  // Modelo de Registro
  registerData = {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: 'Córdoba',
    role: 'admin' as 'usuario' | 'admin'
  };
  registerSubmitted = false;

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al panel
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/panel-interno']);
      return;
    }

    // Comprobar parámetros de consulta (logout o no autorizado)
    this.route.queryParams.subscribe(params => {
      if (params['logout'] === 'true') {
        this.infoMessage = 'Has cerrado sesión exitosamente. ¡Hasta pronto!';
      } else if (params['unauthorized'] === 'true') {
        this.errorMessage = 'Acceso protegido. Debes iniciar sesión para ingresar al panel interno.';
      }
    });
  }

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.infoMessage = null;
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Envío del formulario de Inicio de Sesión
   */
  async onLoginSubmit(form: any): Promise<void> {
    this.loginSubmitted = true;
    this.clearAlerts();

    if (form.invalid) {
      this.errorMessage = 'Por favor completa los campos requeridos correctamente.';
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.authService.login(
        this.loginData.identifier,
        this.loginData.password
      );

      this.successMessage = result.message;
      setTimeout(() => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/panel-interno';
        this.router.navigateByUrl(returnUrl);
      }, 700);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al iniciar sesión.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Envío del formulario de Registro de Usuario
   */
  async onRegisterSubmit(form: any): Promise<void> {
    this.registerSubmitted = true;
    this.clearAlerts();

    if (form.invalid) {
      this.errorMessage = 'Por favor revisa que todos los campos requeridos cumplan las validaciones.';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden. Por favor verifícalas.';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.authService.register({
        username: this.registerData.username,
        email: this.registerData.email,
        password: this.registerData.password,
        firstname: this.registerData.firstname,
        lastname: this.registerData.lastname,
        phone: this.registerData.phone,
        city: this.registerData.city,
        role: this.registerData.role
      });

      this.successMessage = `${result.message} Redirigiendo al sitio web...`;
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
    } catch (err: any) {
      this.errorMessage = err.message || 'No se pudo completar el registro.';
    } finally {
      this.isLoading = false;
    }
  }
}

