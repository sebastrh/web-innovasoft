import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {
  formData = {
    nombre: '',
    correo: '',
    telefono: '',
    paquete: 'Paquete Profesional ($9,900 MXN/mes)',
    comentario: ''
  };
  formSubmitted = false;
  successMessage = false;

  onSubmit(form: any) {
    this.formSubmitted = true;
    if (form.valid) {
      this.successMessage = true;
      setTimeout(() => {
        this.successMessage = false;
        form.resetForm({ paquete: 'Paquete Profesional ($9,900 MXN/mes)' });
        this.formSubmitted = false;
      }, 4000);
    }
  }
}
export { Contacto as ContactoComponent };
