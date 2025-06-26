import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bhag',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './bhag.component.html',
  styleUrl: './bhag.component.scss'
})
export class BhagComponent {
  form = {
    bhag: ''
  };

  save(): void {
    const { bhag } = this.form;

    if (!bhag.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa el BHAG® y su descripción.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    console.log('BHAG® guardado:', this.form);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}
