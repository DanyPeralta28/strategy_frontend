import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-centralclient',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './centralclient.component.html',
  styleUrl: './centralclient.component.scss'
})
export class CentralclientComponent {
  preguntas = [
    { pregunta: 'Rango de edad, género y nivel educativo', respuesta: '' },
    { pregunta: '¿Qué aspecto tiene?', respuesta: '' },
    { pregunta: '¿Cómo es un día normal en su posición?', respuesta: '' },
    { pregunta: '¿Qué los mantiene despiertos por la noche? ¿De qué tienen miedo?', respuesta: '' },
    { pregunta: '¿Cuáles son sus objetivos?', respuesta: '' },
    { pregunta: '¿Cuáles son sus desafíos?', respuesta: '' },
    { pregunta: '¿Qué es lo que más les importa en la vida?', respuesta: '' },
    { pregunta: '¿Qué los hace sentir bien?', respuesta: '' },
    { pregunta: '¿Qué los hace sentir atractivos?', respuesta: '' },
    { pregunta: '¿Qué los hace sentir mal?', respuesta: '' },
    { pregunta: '¿Cómo miden su éxito?', respuesta: '' },
    { pregunta: '¿Qué es lo que más necesitan de nosotros para tener éxito?', respuesta: '' },
  ];

  nombreResumen: string = '';
  descripcionResumen: string = '';

  save(): void {
    const respuestasCompletas = this.preguntas.filter(p => p.respuesta.trim() !== '');

    if (respuestasCompletas.length === 0 && this.nombreResumen.trim() === '' && this.descripcionResumen.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Por favor completa al menos una sección antes de guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    const datos = {
      preguntas: this.preguntas,
      resumen: {
        nombre: this.nombreResumen,
        descripcion: this.descripcionResumen
      }
    };

    console.log('Datos guardados:', datos);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Las respuestas han sido almacenadas correctamente.',
      confirmButtonColor: '#003660',
    });
  }
}
