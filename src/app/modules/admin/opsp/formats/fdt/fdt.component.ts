import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fdt',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './fdt.component.html',
  styleUrl: './fdt.component.scss'
})
export class FdtComponent {
  fdtForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.fdtForm = this.fb.group({
      tendencias: ['', Validators.required],
      fortalezas: ['', Validators.required],
      debilidades: ['', Validators.required]
    });

    this.loadFromStorage();
  }

  save(): void {
    localStorage.setItem('fdtData', JSON.stringify(this.fdtForm.value));
    console.log('Guardado FDT:', this.fdtForm.value);
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }

  loadFromStorage(): void {
    const data = localStorage.getItem('fdtData');
    if (data) {
      this.fdtForm.patchValue(JSON.parse(data));
    }
  }
}
