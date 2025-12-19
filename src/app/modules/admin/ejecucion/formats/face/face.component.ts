import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-face',
  imports: [CommonModule, RouterModule],
  templateUrl: './face.component.html',
  styleUrl: './face.component.scss'
})
export class FaceComponent {
  funciones = [
    { nombre: '', accountable: '', kpis: [] as string[], resultados: [] as string[] }
  ];

  addFuncion() {
    this.funciones.push({ nombre: '', accountable: '', kpis: [], resultados: [] });
  }

  addKpi(i: number, event: any) {
    const value = event.target.value.trim();
    if (value) {
      this.funciones[i].kpis.push(value);
      event.target.value = '';
    }
  }

  removeKpi(i: number, ki: number) {
    this.funciones[i].kpis.splice(ki, 1);
  }

  addResultado(i: number, event: any) {
    const value = event.target.value.trim();
    if (value) {
      this.funciones[i].resultados.push(value);
      event.target.value = '';
    }
  }

  removeResultado(i: number, ri: number) {
    this.funciones[i].resultados.splice(ri, 1);
  }

  chipColor(idx: number) {
    const palette = [
      'bg-blue-500', 'bg-green-500', 'bg-amber-400',
      'bg-violet-500', 'bg-cyan-600', 'bg-rose-500'
    ];
    return palette[idx % palette.length];
  }

}
