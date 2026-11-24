export interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  plataforma: 'Facebook' | 'Instagram';
  tipo: 'Imagen' | 'Carrusel' | 'Reel';
  fecha?: string;
  likes?: number;
}

export type PublicacionInput = Omit<Publicacion, 'id'>;
