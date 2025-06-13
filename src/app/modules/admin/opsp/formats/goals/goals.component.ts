import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-goals',
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent {
  campos = [
    'Año Fiscal',
    'Ingresos',
    'Utilidad',
    'Margen Bruto',
    'Efectivo',
    'Días en Cuentas por Cobrar',
    'Días de Rotación de Inventario',
    'Ingreso/Empleado'
  ];

  trimestres = Array(4).fill(null);

  metas = {
    largo: {},   // 3-5 años
    medio: {},   // 1 año
    trimestres: {
      T1: {},
      T2: {},
      T3: {},
      T4: {}
    }
  };

  guardar(): void {
    console.log('Metas:', this.metas);
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Las metas han sido registradas correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}
