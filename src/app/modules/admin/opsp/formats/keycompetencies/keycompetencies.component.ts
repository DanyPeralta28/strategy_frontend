import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule  } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-keycompetencies',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './keycompetencies.component.html',
  styleUrl: './keycompetencies.component.scss'
})
export class KeycompetenciesComponent {
  form = {
    central: '',
    centralExplanation: '',
    claveCompetencias: [
      { nombre: '', descripcion: '' }
    ]
  };

  addCompetencia(): void {
    this.form.claveCompetencias.push({ nombre: '', descripcion: '' });
  }

  removeCompetencia(index: number): void {
    this.form.claveCompetencias.splice(index, 1);
  }

  save(): void {
    const competenciasFiltradas = this.form.claveCompetencias.filter(
      item => item.nombre.trim() !== '' || item.descripcion.trim() !== ''
    );

    const data = {
      central: this.form.central.trim(),
      centralExplanation: this.form.centralExplanation.trim(),
      claveCompetencias: competenciasFiltradas
    };

    if (!data.central || !data.centralExplanation) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa la competencia central y su explicación.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    console.log('Datos guardados:', data);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han guardado correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}
