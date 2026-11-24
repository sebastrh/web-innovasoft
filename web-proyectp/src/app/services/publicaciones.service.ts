import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion, PublicacionInput } from '../models/publicacion.model';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  
  // Endpoint de MockAPI configurado con tu proyecto
  public apiUrl = 'https://6b05f30b57fa1297bb5551f4.mockapi.io/api/v1/publicaciones';

  // Obtener todas las publicaciones
  obtenerPublicaciones(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(this.apiUrl);
  }

  // Obtener una publicación por ID
  obtenerPublicacionPorId(id: string): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva publicación
  crearPublicacion(publicacion: PublicacionInput): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.apiUrl, publicacion);
  }

  // Actualizar una publicación existente
  actualizarPublicacion(id: string, publicacion: Partial<PublicacionInput>): Observable<Publicacion> {
    return this.http.put<Publicacion>(`${this.apiUrl}/${id}`, publicacion);
  }

  // Eliminar una publicación
  eliminarPublicacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
