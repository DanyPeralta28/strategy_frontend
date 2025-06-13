import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-culture',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './culture.component.html',
  styleUrl: './culture.component.scss'
})
export class CultureComponent {
  form = {
    nombre: '',
    descripcion: '',
  };

  save(): void {
    if (!this.form.nombre.trim() || !this.form.descripcion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa ambos campos antes de guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    // Aquí puedes usar localStorage, un servicio o API
    console.log('Datos guardados:', this.form);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'La información de la cultura ha sido guardada exitosamente.',
      confirmButtonColor: '#003660',
    });
  }
}
