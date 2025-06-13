import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.fdtForm = this.fb.group({
      tendencias: ['', Validators.required],
      fortalezas: ['', Validators.required],
      debilidades: ['', Validators.required]
    });
  }

  save(): void {
    if (this.fdtForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const data = this.fdtForm.value;
    console.log('FDT Form:', data);

    // Enviar a backend aquí si deseas
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}