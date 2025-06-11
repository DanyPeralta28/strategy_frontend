import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vision',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './vision.component.html',
  styleUrl: './vision.component.scss'
})
export class VisionComponent {
  visionForm!: FormGroup;

  estados = [
    { icono: '🟢', placeholder: 'Excelente (verde oscuro)' },
    { icono: '🟢', placeholder: 'Bien (verde claro)' },
    { icono: '🟡', placeholder: 'Entre verde y rojo' },
    { icono: '🔴', placeholder: 'En problemas (rojo)' }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.visionForm = this.fb.group({
      valores: ['', Validators.required],
      proposito: ['', Validators.required],
      promesas: ['', Validators.required],
      bhag: ['', Validators.required],
      prioridades: this.fb.group({
        largo: ['', Validators.required],
        medio: ['', Validators.required],
        corto: ['', Validators.required]
      }),
      kpis: this.fb.array(this.createKpiRows(3)),
      ganarJuego1: this.fb.array(this.createGanarJuegoRows()),
      ganarJuego2: this.fb.array(this.createGanarJuegoRows()),
      prioridadesTrimestrales: this.fb.array(this.createPrioridadRows(5))
    });

    this.loadFromStorage();
  }

  createKpiRows(count: number): FormGroup[] {
    return Array.from({ length: count }, () =>
      this.fb.group({
        kpi: ['', Validators.required],
        meta: ['', Validators.required]
      })
    );
  }

  createPrioridadRows(count: number): FormGroup[] {
    return Array.from({ length: count }, () =>
      this.fb.group({
        prioridad: ['', Validators.required],
        plazo: ['', Validators.required]
      })
    );
  }

  createGanarJuegoRows(): FormGroup[] {
    return this.estados.map(() =>
      this.fb.group({
        descripcion: ['', Validators.required]
      })
    );
  }

  get kpis(): FormArray {
    return this.visionForm.get('kpis') as FormArray;
  }

  get ganarJuego1(): FormArray {
    return this.visionForm.get('ganarJuego1') as FormArray;
  }

  get ganarJuego2(): FormArray {
    return this.visionForm.get('ganarJuego2') as FormArray;
  }

  get prioridadesTrimestrales(): FormArray {
    return this.visionForm.get('prioridadesTrimestrales') as FormArray;
  }

  save(): void {
    localStorage.setItem('visionData', JSON.stringify(this.visionForm.value));
    console.log(JSON.stringify(this.visionForm.value))
    console.log(this.visionForm.value);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }

  loadFromStorage(): void {
    const data = localStorage.getItem('visionData');
    if (data) {
      this.visionForm.patchValue(JSON.parse(data));
    }
  }
}
