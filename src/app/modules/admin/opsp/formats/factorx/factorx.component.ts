import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-factorx',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './factorx.component.html',
  styleUrl: './factorx.component.scss',
})
export class FactorxComponent {
  stepGrid = [
    { type: 'start', icon: '💡', label: 'INICIO' },
    { type: 'step', step_order: 1, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 2, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 3, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 4, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 5, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 6, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 7, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 8, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 9, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 10, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'end', icon: '📦', label: '$$$' }
  ];

  bottlenecks = [
    { descripcion: '', lider: '', fecha: '' }
  ];

  ferias = [
    { descripcion: '', lider: '', fecha: '' }
  ];

  toggleInefficiency(box: any): void {
    box.has_inefficiency = !box.has_inefficiency;
  }

  addBottleneck(): void {
    this.bottlenecks.push({ descripcion: '', lider: '', fecha: '' });
  }

  removeBottleneck(index: number): void {
    if (this.bottlenecks.length > 1) {
      this.bottlenecks.splice(index, 1);
    }
  }

  addFeria(): void {
    this.ferias.push({ descripcion: '', lider: '', fecha: '' });
  }

  removeFeria(index: number): void {
    if (this.ferias.length > 1) {
      this.ferias.splice(index, 1);
    }
  }

  save(): void {
    const payload = {
      pasos: this.stepGrid
        .filter(step => step.type === 'step')
        .map(step => ({
          orden: step.step_order,
          descripcion: step.step_label,
          tiene_ineficiencia: step.has_inefficiency
        })),
      cuellosDeBotella: this.bottlenecks,
      feriaComercial: this.ferias
    };

    console.log('DATA COMPLETA:', payload);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han capturado correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}
