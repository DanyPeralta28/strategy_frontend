import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-strata',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './strata.component.html',
  styleUrl: './strata.component.scss'
})
export class StrataComponent implements OnInit {
  sevenForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.sevenForm = this.fb.group({
      uniqueWords: [''],
      brandTerritory: this.fb.group({
        customer: [''],
        what: [''],
        where: [''],
        promises: [''],
      }),
      brandGuarantee: [''],
      strategy: [''],
      differentiators: this.fb.array([]),
      factorX: [''],
      profitPerX: [''],
      bhag: [''],
    });
  }

  /** ---------- getters ---------- */
  get differentiators(): FormArray {
    return this.sevenForm.get('differentiators') as FormArray;
  }

  /** ---------- helpers ---------- */
  addDifferentiator(): void {
    this.differentiators.push(this.fb.group({ value: [''] }));
  }

  removeDifferentiator(index: number): void {
    this.differentiators.removeAt(index);
  }

  /** ---------- save ---------- */
  save(): void {
    if (this.sevenForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    console.log('7 Estratos:', this.sevenForm.value);

    // POST al backend con HttpClient si lo necesitas
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660',
    });
  }
}