import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-purpose',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './purpose.component.html',
  styleUrl: './purpose.component.scss'
})
export class PurposeComponent {
  form = {
    purpose: '',
  };

  save(): void {
    const { purpose } = this.form;

    if (!purpose.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa el propósito y su explicación.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    // Aquí puedes enviar los datos al backend si es necesario
    console.log('Propósito guardado:', this.form);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}
