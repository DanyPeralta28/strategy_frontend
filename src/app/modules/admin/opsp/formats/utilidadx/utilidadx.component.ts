import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-utilidadx',
  imports: [CommonModule, FormsModule],
  templateUrl: './utilidadx.component.html',
  styleUrl: './utilidadx.component.scss'
})
export class UtilidadxComponent {
  utilidadPorX: string = '';

  guardar(): void {
    if (!this.utilidadPorX.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor describe tu indicador de Utilidad por X.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    console.log('Utilidad por X:', this.utilidadPorX);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'La información ha sido registrada correctamente.',
      confirmButtonColor: '#003660'
    });
  }

}
