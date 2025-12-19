import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-formats',
  imports: [CommonModule, RouterModule],
  templateUrl: './formats.component.html',
  styleUrl: './formats.component.scss'
})
export class FormatsComponent {
  formatos = [
    { nombre: 'FACE', descripcion: 'Cuadro de Funciones y Responsabilidad', link: 'face' },
    { nombre: 'PACE', descripcion: ': Cuadro de Procesos y Responsabilidad', link: 'pace' },
    { nombre: 'Hábitos de Rockefeller', descripcion: 'Hábitos de Rockefeller', link: 'rockefeller' },
    { nombre: 'WWW', descripcion: 'Seguimiento de responsabilidad', link: 'www' },
  ];

  constructor(private router: Router) { }

  goFormat(link: string) {
    this.router.navigate(['/ejecucion/formats', link]);
  }
}
