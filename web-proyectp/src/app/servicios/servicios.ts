import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [RouterLink, Navbar],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class Servicios {}
export { Servicios as ServiciosComponent };
