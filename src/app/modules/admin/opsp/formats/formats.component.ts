import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formats',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './formats.component.html',
  styleUrls: ['./formats.component.scss']
})

export class FormatsComponent {
  formatos = [
    { nombre: 'BHAG', descripcion: 'Meta grande, audaz y a largo plazo', link: '' },
    { nombre: 'Visión', descripcion: 'Describe el estado futuro deseado', link: 'vision' },
    { nombre: '7 Estratos', descripcion: 'Estrategia organizacional distribuida', link: 'strata' },
    { nombre: 'FDT', descripcion: 'Fortalezas, Debilidades y Tendencias', link: 'fdt' },
    { nombre: 'Factor X', descripcion: 'Descubriendo su ventaja 10X', link: 'factorx' },
    { nombre: 'Balance de KPIs', descripcion: 'Indicadores clave de rendimiento', link: '' },
    { nombre: 'Utilidad por X', descripcion: 'Relación de ganancias por unidad clave', link: '' },
    { nombre: 'Metas', descripcion: 'Objetivos específicos y medibles', link: '' },
    { nombre: 'Flywheel', descripcion: 'Modelo de impulso organizacional', link: '' },
    { nombre: 'Valores Centrales', descripcion: 'Principios que guían la cultura', link: '' },
    { nombre: 'Propósito', descripcion: 'Razón de ser de la organización', link: '' },
    { nombre: 'Competencias clave', descripcion: 'Habilidades clave del equipo', link: '' },
    { nombre: 'Promesa de marca', descripcion: 'Compromiso con el cliente', link: '' },
    { nombre: 'Territorio', descripcion: 'Ámbito geográfico o conceptual', link: '' },
    { nombre: 'Cultura', descripcion: 'Forma en que se hacen las cosas', link: '' },
    { nombre: 'Cliente Central', descripcion: 'Segmento clave al que se sirve', link: '' }
  ];

  constructor(private router: Router) {}

  goFormat(link: string) {
    this.router.navigate(['/opsp/formats', link]);
  }
}
