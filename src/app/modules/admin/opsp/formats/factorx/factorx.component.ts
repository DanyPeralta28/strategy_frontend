import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-factorx',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './factorx.component.html',
  styleUrl: './factorx.component.scss'
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
    { descripcion: '', lider: '', fecha: '' },
    { descripcion: '', lider: '', fecha: '' },
    { descripcion: '', lider: '', fecha: '' }
  ];

  feria = { descripcion: '', lider: '', fecha: '' };

  save(): void {

    // localStorage.setItem('factorXData', JSON.stringify(data));
    // console.log('Guardado con éxito:', data);
  }

  load(): void {
    // const data = localStorage.getItem('factorXData');
    // if (data) {
    //   this.steps = JSON.parse(data).pasos;
    // }
  }

  ngOnInit(): void {
    this.load();
  }

  toggleInefficiency(box: any): void {
    box.has_inefficiency = !box.has_inefficiency;
  }
}
