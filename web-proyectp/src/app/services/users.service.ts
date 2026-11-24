import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly url = 'https://fakestoreapi.com/users';
  private readonly http = inject(HttpClient);

  // Obtener todos los usuarios de la API
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  // Obtener un usuario por su ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  // Crear un nuevo usuario en la API
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.url, user);
  }

  // Actualizar un usuario en la API
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, user);
  }

  // Eliminar un usuario en la API
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
