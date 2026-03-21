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
    { nombre: 'BHAG®', descripcion: 'Meta grande, audaz y a largo plazo', link: 'bhag' },
    { nombre: 'Visión', descripcion: 'Describe el estado futuro deseado', link: 'vision' },
    { nombre: '7 Estratos', descripcion: 'Estrategia organizacional distribuida', link: 'strata' },
    { nombre: 'FDT', descripcion: 'Fortalezas, Debilidades y Tendencias', link: 'fdt' },
    { nombre: 'Factor X', descripcion: 'Descubriendo su ventaja 10X', link: 'factorx' },
    { nombre: 'Balance de KPIs', descripcion: 'Indicadores clave de rendimiento', link: 'balancekpis' },
    { nombre: 'Utilidad por X', descripcion: 'Relación de ganancias por unidad clave', link: 'utilidadx' },
    { nombre: 'Metas', descripcion: 'Objetivos específicos y medibles', link: 'goals' },
    { nombre: 'Flywheel', descripcion: 'Modelo de impulso organizacional', link: 'flywheel' },
    { nombre: 'Valores Centrales', descripcion: 'Principios que guían la cultura', link: 'corevalues' },
    { nombre: 'Propósito', descripcion: 'Razón de ser de la organización', link: 'purpose' },
    { nombre: 'Competencias clave', descripcion: 'Habilidades clave del equipo', link: 'keycompetencies' },
    { nombre: 'Promesa de marca', descripcion: 'Compromiso con el cliente', link: 'brandpromises' },
    { nombre: 'Territorio', descripcion: 'Ámbito geográfico o conceptual', link: 'territory' },
    { nombre: 'Cultura', descripcion: 'Forma en que se hacen las cosas', link: 'culture' },
    { nombre: 'Cliente Central', descripcion: 'Segmento clave al que se sirve', link: 'centralclient' }
  ];

  constructor(private router: Router) {}

  goFormat(link: string) {
    this.router.navigate(['/opsp/formats', link]);
  }
}
