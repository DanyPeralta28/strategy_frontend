import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-brandpromises',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './brandpromises.component.html',
  styleUrl: './brandpromises.component.scss'
})
export class BrandpromisesComponent {
  // Campos principales
  clienteCentral: string = '';
  promesaLider: string = '';
  descripcionLider: string = '';

  promesa2: string = '';
  descripcion2: string = '';

  promesa3: string = '';
  descripcion3: string = '';

  save(): void {
    const datos = {
      clienteCentral: this.clienteCentral.trim(),
      promesaLider: this.promesaLider.trim(),
      descripcionLider: this.descripcionLider.trim(),
      promesa2: this.promesa2.trim(),
      descripcion2: this.descripcion2.trim(),
      promesa3: this.promesa3.trim(),
      descripcion3: this.descripcion3.trim(),
    };

    const hayContenido = Object.values(datos).some(valor => valor !== '');

    if (!hayContenido) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Por favor completa al menos un campo antes de guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    console.log('Datos guardados de Promesa de Marca:', datos);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos de la Promesa de Marca han sido almacenados correctamente.',
      confirmButtonColor: '#003660',
    });
  }
}
