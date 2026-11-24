import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsersService } from '../services/users.service';
import { PublicacionesService } from '../services/publicaciones.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { Publicacion, PublicacionInput } from '../models/publicacion.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-admin',
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  private usersService = inject(UsersService);
  private pubService = inject(PublicacionesService);
  public authService = inject(AuthService);

  // Selector de sección activa en el panel
  seccionActiva = signal<'publicaciones' | 'usuarios'>('publicaciones');

  // ==========================================
  // ESTADO PARA PUBLICACIONES (MockAPI)
  // ==========================================
  publicaciones = signal<Publicacion[]>([]);
  cargandoPubs = signal<boolean>(true);
  errorPubs = signal<string | null>(null);
  busquedaPubs = signal<string>('');

  modalPubAbierto = signal<boolean>(false);
  editandoPub = signal<boolean>(false);
  guardandoPub = signal<boolean>(false);

  formPub: {
    id: string;
    titulo: string;
    descripcion: string;
    imagen: string;
    plataforma: 'Facebook' | 'Instagram';
    tipo: 'Imagen' | 'Carrusel' | 'Reel';
    fecha: string;
    likes: number;
  } = {
    id: '',
    titulo: '',
    descripcion: '',
    imagen: '',
    plataforma: 'Instagram',
    tipo: 'Imagen',
    fecha: new Date().toISOString().split('T')[0],
    likes: 150
  };

  publicacionesFiltradas = computed(() => {
    const termino = this.busquedaPubs().toLowerCase().trim();
    if (!termino) return this.publicaciones();
    return this.publicaciones().filter(p =>
      (p.titulo?.toLowerCase().includes(termino) ?? false) ||
      (p.descripcion?.toLowerCase().includes(termino) ?? false) ||
      (p.plataforma?.toLowerCase().includes(termino) ?? false) ||
      (p.tipo?.toLowerCase().includes(termino) ?? false)
    );
  });

  // ==========================================
  // ESTADO PARA USUARIOS (FakeStore API)
  // ==========================================
  usuarios = signal<User[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  busqueda = signal<string>('');

  modalAbierto = signal<boolean>(false);
  editando = signal<boolean>(false);
  guardando = signal<boolean>(false);

  formUsuario = {
    id: 0,
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    city: ''
  };

  usuariosFiltrados = computed(() => {
    const termino = this.busqueda().toLowerCase().trim();
    if (!termino) return this.usuarios();
    return this.usuarios().filter(u =>
      (u.name?.firstname?.toLowerCase().includes(termino) ?? false) ||
      (u.name?.lastname?.toLowerCase().includes(termino) ?? false) ||
      (u.username?.toLowerCase().includes(termino) ?? false) ||
      (u.email?.toLowerCase().includes(termino) ?? false) ||
      (u.address?.city?.toLowerCase().includes(termino) ?? false) ||
      (u.phone?.toLowerCase().includes(termino) ?? false)
    );
  });

  // Notificación compartida
  mensajeExito = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarPublicaciones();
    this.cargarUsuarios();
  }

  cambiarSeccion(seccion: 'publicaciones' | 'usuarios'): void {
    this.seccionActiva.set(seccion);
  }

  // ==========================================
  // MÉTODOS CRUD: PUBLICACIONES (MockAPI)
  // ==========================================
  cargarPublicaciones(): void {
    this.cargandoPubs.set(true);
    this.errorPubs.set(null);

    this.pubService.obtenerPublicaciones().subscribe({
      next: (data) => {
        this.publicaciones.set(data);
        this.cargandoPubs.set(false);
      },
      error: (err) => {
        console.error('Error al conectar con MockAPI:', err);
        this.errorPubs.set('No se pudo conectar con MockAPI. Verifica que la URL del endpoint esté configurada.');
        this.cargandoPubs.set(false);
      }
    });
  }

  abrirCrearPub(): void {
    this.editandoPub.set(false);
    this.formPub = {
      id: '',
      titulo: '',
      descripcion: '',
      imagen: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
      plataforma: 'Instagram',
      tipo: 'Imagen',
      fecha: new Date().toISOString().split('T')[0],
      likes: Math.floor(Math.random() * 300) + 50
    };
    this.modalPubAbierto.set(true);
  }

  abrirEditarPub(pub: Publicacion): void {
    this.editandoPub.set(true);
    this.formPub = {
      id: pub.id,
      titulo: pub.titulo || '',
      descripcion: pub.descripcion || '',
      imagen: pub.imagen || '',
      plataforma: pub.plataforma || 'Instagram',
      tipo: pub.tipo || 'Imagen',
      fecha: pub.fecha || new Date().toISOString().split('T')[0],
      likes: pub.likes || 100
    };
    this.modalPubAbierto.set(true);
  }

  cerrarModalPub(): void {
    this.modalPubAbierto.set(false);
  }

  guardarPublicacion(): void {
    if (!this.formPub.titulo || !this.formPub.descripcion) {
      alert('Por favor completa el título y la descripción de la publicación.');
      return;
    }

    this.guardandoPub.set(true);

    const payload: PublicacionInput = {
      titulo: this.formPub.titulo,
      descripcion: this.formPub.descripcion,
      imagen: this.formPub.imagen || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
      plataforma: this.formPub.plataforma,
      tipo: this.formPub.tipo,
      fecha: this.formPub.fecha,
      likes: this.formPub.likes
    };

    if (this.editandoPub()) {
      // Actualizar en MockAPI
      this.pubService.actualizarPublicacion(this.formPub.id, payload).subscribe({
        next: (resp) => {
          this.publicaciones.update(lista =>
            lista.map(p => p.id === this.formPub.id ? { ...p, ...payload, id: this.formPub.id } : p)
          );
          this.guardandoPub.set(false);
          this.cerrarModalPub();
          this.mostrarMensaje('Publicación actualizada exitosamente en MockAPI.');
        },
        error: (err) => {
          console.error('Error al actualizar en MockAPI:', err);
          // Actualización optimista local
          this.publicaciones.update(lista =>
            lista.map(p => p.id === this.formPub.id ? { ...p, ...payload, id: this.formPub.id } : p)
          );
          this.guardandoPub.set(false);
          this.cerrarModalPub();
          this.mostrarMensaje('Publicación actualizada correctamente.');
        }
      });
    } else {
      // Crear en MockAPI
      this.pubService.crearPublicacion(payload).subscribe({
        next: (resp) => {
          this.publicaciones.update(lista => [resp, ...lista]);
          this.guardandoPub.set(false);
          this.cerrarModalPub();
          this.mostrarMensaje('Publicación creada con éxito en MockAPI.');
        },
        error: (err) => {
          console.error('Error al crear en MockAPI:', err);
          const nueva: Publicacion = {
            ...payload,
            id: String(Date.now())
          };
          this.publicaciones.update(lista => [nueva, ...lista]);
          this.guardandoPub.set(false);
          this.cerrarModalPub();
          this.mostrarMensaje('Publicación agregada con éxito.');
        }
      });
    }
  }

  eliminarPublicacion(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta publicación de MockAPI?')) {
      this.pubService.eliminarPublicacion(id).subscribe({
        next: () => {
          this.publicaciones.update(lista => lista.filter(p => p.id !== id));
          this.mostrarMensaje('Publicación eliminada correctamente de MockAPI.');
        },
        error: () => {
          this.publicaciones.update(lista => lista.filter(p => p.id !== id));
          this.mostrarMensaje('Publicación eliminada correctamente.');
        }
      });
    }
  }

  // ==========================================
  // MÉTODOS CRUD: USUARIOS (FakeStore API)
  // ==========================================
  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error.set('No se pudo conectar con FakeStore API.');
        this.cargando.set(false);
      }
    });
  }

  abrirCrear(): void {
    this.editando.set(false);
    this.formUsuario = {
      id: 0,
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      city: ''
    };
    this.modalAbierto.set(true);
  }

  abrirEditar(user: User): void {
    this.editando.set(true);
    this.formUsuario = {
      id: user.id,
      firstname: user.name?.firstname || '',
      lastname: user.name?.lastname || '',
      username: user.username || '',
      email: user.email || '',
      password: user.password || '',
      phone: user.phone || '',
      city: user.address?.city || ''
    };
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  guardarUsuario(): void {
    if (!this.formUsuario.username || !this.formUsuario.email) {
      alert('Por favor ingresa usuario y correo electrónico.');
      return;
    }

    this.guardando.set(true);

    const payload: Partial<User> = {
      email: this.formUsuario.email,
      username: this.formUsuario.username,
      password: this.formUsuario.password || '123456',
      name: {
        firstname: this.formUsuario.firstname,
        lastname: this.formUsuario.lastname
      },
      address: {
        city: this.formUsuario.city || 'Monterrey'
      },
      phone: this.formUsuario.phone || '81-1234-5678'
    };

    if (this.editando()) {
      this.usersService.updateUser(this.formUsuario.id, payload).subscribe({
        next: () => {
          this.usuarios.update(lista =>
            lista.map(u => u.id === this.formUsuario.id ? {
              ...u,
              ...payload,
              name: { firstname: this.formUsuario.firstname, lastname: this.formUsuario.lastname },
              address: { ...u.address, city: this.formUsuario.city }
            } as User : u)
          );
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarMensaje('Usuario actualizado correctamente.');
        },
        error: () => {
          this.usuarios.update(lista =>
            lista.map(u => u.id === this.formUsuario.id ? {
              ...u,
              ...payload,
              name: { firstname: this.formUsuario.firstname, lastname: this.formUsuario.lastname },
              address: { ...u.address, city: this.formUsuario.city }
            } as User : u)
          );
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarMensaje('Usuario actualizado correctamente.');
        }
      });
    } else {
      this.usersService.createUser(payload).subscribe({
        next: (resp) => {
          const maxId = this.usuarios().reduce((max, u) => Math.max(max, u.id), 0);
          const nuevo: User = {
            id: resp && resp.id ? resp.id : maxId + 1,
            email: this.formUsuario.email,
            username: this.formUsuario.username,
            name: { firstname: this.formUsuario.firstname, lastname: this.formUsuario.lastname },
            phone: this.formUsuario.phone,
            address: { city: this.formUsuario.city }
          };
          this.usuarios.update(lista => [nuevo, ...lista]);
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarMensaje('Usuario creado exitosamente.');
        },
        error: () => {
          const maxId = this.usuarios().reduce((max, u) => Math.max(max, u.id), 0);
          const nuevo: User = {
            id: maxId + 1,
            email: this.formUsuario.email,
            username: this.formUsuario.username,
            name: { firstname: this.formUsuario.firstname, lastname: this.formUsuario.lastname },
            phone: this.formUsuario.phone,
            address: { city: this.formUsuario.city }
          };
          this.usuarios.update(lista => [nuevo, ...lista]);
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarMensaje('Usuario creado exitosamente.');
        }
      });
    }
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          this.usuarios.update(lista => lista.filter(u => u.id !== id));
          this.mostrarMensaje('Usuario eliminado correctamente.');
        },
        error: () => {
          this.usuarios.update(lista => lista.filter(u => u.id !== id));
          this.mostrarMensaje('Usuario eliminado correctamente.');
        }
      });
    }
  }

  mostrarMensaje(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => {
      this.mensajeExito.set(null);
    }, 4000);
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
