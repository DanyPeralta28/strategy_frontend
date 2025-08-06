import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formats',
  imports: [CommonModule, RouterModule],
  templateUrl: './formats.component.html',
  styleUrl: './formats.component.scss'
})
export class FormatsComponent {
  formatos = [
    { nombre: 'IEL', descripcion: 'Índice de eficiencia laboral', link: 'iel' },
    { nombre: 'Optimización de cash', descripcion: 'Estrategias para Optimizar el Efectivo', link: 'optcash' },
    { nombre: 'Valor', descripcion: 'La Jerarquía del Ingreso Recurrente', link: 'value' },
    { nombre: 'Financiamiento', descripcion: 'Checklist para el Éxito', link: 'finance' },
  ];

  constructor(private router: Router) { }

  goFormat(link: string) {
    this.router.navigate(['/cash/formats', link]);
  }

}
