import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type EstadoWWW = 'En proceso' | 'Ejecutado' | 'Atrasado' | 'Pendiente' | '';

interface WWWRow {
  que: string;
  quien: string;
  cuando: string;       // ISO yyyy-mm-dd
  estado: EstadoWWW;
  nuevoCuando: string;  // ISO yyyy-mm-dd
}

@Component({
  selector: 'app-www',
  imports: [CommonModule, RouterModule],
  templateUrl: './www.component.html',
  styleUrl: './www.component.scss'
})
export class WwwComponent {
  estados: EstadoWWW[] = ['En proceso', 'Ejecutado', 'Atrasado', 'Pendiente', ''];

  filas: WWWRow[] = [
    { que: '', quien: '', cuando: '', estado: '', nuevoCuando: '' }
  ];

  trackByIndex = (_: number, __: WWWRow) => _;

  addRow() {
    this.filas.push({ que: '', quien: '', cuando: '', estado: '', nuevoCuando: '' });
  }

  removeRow(i: number) {
    this.filas.splice(i, 1);
    if (!this.filas.length) this.addRow();
  }

  limpiarVacias() {
    this.filas = this.filas.filter(r =>
      (r.que?.trim() || r.quien?.trim() || r.cuando || r.estado || r.nuevoCuando)
    );
    if (!this.filas.length) this.addRow();
  }

  guardar() {
    const payload = this.filas.map((r, idx) => ({ no: idx + 1, ...r }));
    console.log('WWW guardar:', payload);
    // Aquí después llamamos a tu servicio/endpoint real.
    // Swal.fire('Guardado', 'Registros actualizados', 'success');
  }

  estadoBadgeClass(estado: EstadoWWW) {
    switch (estado) {
      case 'Ejecutado': return 'bg-emerald-600';
      case 'En proceso': return 'bg-blue-600';
      case 'Atrasado': return 'bg-rose-600';
      case 'Pendiente': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  }
}
