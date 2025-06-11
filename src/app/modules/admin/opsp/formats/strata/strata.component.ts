import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-strata',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './strata.component.html',
  styleUrl: './strata.component.scss'
})
export class StrataComponent {
  sevenForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.sevenForm = this.fb.group({
      palabrasPropias: ['', Validators.required],
      territorio: this.fb.group({
        cliente: ['', Validators.required],
        que: ['', Validators.required],
        donde: ['', Validators.required],
        promesas: ['', Validators.required],
      }),
      garantia: ['', Validators.required],
      estrategia: ['', Validators.required],
      actividades: ['', Validators.required],
      factorX: ['', Validators.required],
      utilidadX: ['', Validators.required],
      bhag: ['', Validators.required],
    });

    this.loadFromStorage();
  }

  save(): void {
    // if (this.sevenForm.invalid) return;

    localStorage.setItem('sevenStrataData', JSON.stringify(this.sevenForm.value));
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }

  loadFromStorage(): void {
    const data = localStorage.getItem('sevenStrataData');
    if (data) {
      this.sevenForm.patchValue(JSON.parse(data));
    }
  }
}
