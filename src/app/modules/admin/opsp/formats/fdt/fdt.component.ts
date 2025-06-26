import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fdt',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './fdt.component.html',
  styleUrl: './fdt.component.scss'
})
export class FdtComponent implements OnInit {
  fdtForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  get tendencias(): FormArray {
    return this.fdtForm.get('tendencias') as FormArray;
  }
  get fortalezas(): FormArray {
    return this.fdtForm.get('fortalezas') as FormArray;
  }
  get debilidades(): FormArray {
    return this.fdtForm.get('debilidades') as FormArray;
  }

  ngOnInit(): void {
    this.fdtForm = this.fb.group({
      tendencias: this.fb.array([]),
      fortalezas: this.fb.array([]),
      debilidades: this.fb.array([]),
    });
  }

  /* ---------- helpers genéricos ---------- */
  addItem(array: FormArray): void {
    array.push(this.fb.control(''));
  }

  removeItem(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  save(): void {
    if (this.fdtForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    console.log('FDT:', this.fdtForm.value);
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660',
    });
  }
}