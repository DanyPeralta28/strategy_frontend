import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.sevenForm = this.fb.group({
      palabrasPropias: ['', Validators.required],
      territorio: this.fb.group({
        cliente: ['', Validators.required],
        que: ['', Validators.required],
        donde: ['', Validators.required],
        promesas: ['', Validators.required]
      }),
      garantia: ['', Validators.required],
      estrategia: ['', Validators.required],
      actividades: ['', Validators.required],
      factorX: ['', Validators.required],
      utilidadX: ['', Validators.required],
      bhag: ['', Validators.required]
    });
  }

  save(): void {
    if (this.sevenForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const formData = this.sevenForm.value;
    console.log(formData);

    // Aquí puedes hacer un POST al backend con HttpClient
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}