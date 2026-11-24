import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [RouterLink, Navbar],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css'
})
export class Nosotros {}
export { Nosotros as NosotrosComponent };
