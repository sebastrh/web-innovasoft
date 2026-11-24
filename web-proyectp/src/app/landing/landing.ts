import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Hero } from '../hero/hero';
import { Contacto } from '../contacto/contacto';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, Navbar, Hero, Contacto],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {}
export { Landing as LandingComponent };
