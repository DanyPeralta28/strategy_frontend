import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-corevalues',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './corevalues.component.html',
  styleUrl: './corevalues.component.scss'
})
export class CorevaluesComponent {
  valores = [
    { nombre: '', corta: '', larga: '' }
  ];

  agregarValor(): void {
    this.valores.push({ nombre: '', corta: '', larga: '' });
  }

  eliminarValor(index: number): void {
    this.valores.splice(index, 1);
  }

  guardarValores(): void {
    const valoresFiltrados = this.valores.filter(v =>
      v.nombre.trim() !== '' || v.corta.trim() !== '' || v.larga.trim() !== ''
    );

    console.log('Valores guardados:', valoresFiltrados);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los valores se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}
