import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { PublicacionesService } from '../services/publicaciones.service';
import { Publicacion } from '../models/publicacion.model';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
export class Publicaciones implements OnInit {
  private servicio = inject(PublicacionesService);

  publicaciones = signal<Publicacion[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  filtroPlataforma = signal<string>('todas');

  publicacionesFiltradas = computed(() => {
    const filtro = this.filtroPlataforma();
    if (filtro === 'todas') return this.publicaciones();
    return this.publicaciones().filter(p => p.plataforma === filtro);
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.obtenerPublicaciones().subscribe({
      next: (data) => {
        this.publicaciones.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando publicaciones:', err);
        this.error.set('No se pudieron cargar las publicaciones desde MockAPI.');
        this.cargando.set(false);
      }
    });
  }
}
