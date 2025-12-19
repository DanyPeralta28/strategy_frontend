import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ProcesoPACE {
  proceso: string;
  responsable: string;
  kpis: string[];
}

@Component({
  selector: 'app-pace',
  imports: [CommonModule, RouterModule],
  templateUrl: './pace.component.html',
  styleUrl: './pace.component.scss'
})
export class PaceComponent {
  procesos: ProcesoPACE[] = [
    { proceso: '', responsable: '', kpis: [] }
  ];

  addProceso() {
    this.procesos.push({ proceso: '', responsable: '', kpis: [] });
  }

  addKpi(i: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = (input.value || '').trim();
    if (!value) return;
    this.procesos[i].kpis.push(value);
    input.value = '';
  }

  removeKpi(i: number, kIndex: number) {
    this.procesos[i].kpis.splice(kIndex, 1);
  }

  chipColor(idx: number) {
    const palette = [
      'bg-blue-500', 'bg-green-500', 'bg-amber-400',
      'bg-violet-500', 'bg-cyan-600', 'bg-rose-500'
    ];
    return palette[idx % palette.length];
  }
}
