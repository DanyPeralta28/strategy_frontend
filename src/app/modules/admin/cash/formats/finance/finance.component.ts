import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface FundingItem {
  title: string;
  checks: string[];
  selected: boolean[];
  score: number | null;
}

interface FinancingAttribute {
  descripcion: string;
  lider: string;
  trimestre: string;
}

@Component({
  selector: 'app-finance',
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss'
})
export class FinanceComponent {
  fundingItems: FundingItem[] = [
    {
      title: 'Equipo Ejecutivo',
      checks: ['Historial de éxito', 'Experiencia relevante', 'Aprendizaje continuo'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Modelo de Negocio',
      checks: ['Ingresos recurrentes', 'Ventaja competitiva identificada', 'Crecimiento del Mercado y base de clientes'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Valores Fundamentales y Plan Operativo',
      checks: ['Propósito/Visión/Valores', 'Plan Estratégico en Una Página', '“Checklist” del Dominio de los Hábitos de Rockefeller'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Experiencia en el campo específico (Industria y Nicho)',
      checks: ['Panorama competitivo', 'Liderazgo industrial'],
      selected: [false, false],
      score: null
    },
    {
      title: 'Estrategia de Salida y Plan',
      checks: ['Adquisiciones potenciales identificadas', 'Valoraciones y factores multiplicadores investigados'],
      selected: [false, false],
      score: null
    },
    {
      title: 'Mantener su “Casa” en Orden',
      checks: ['Estructura de capitalización clara y documentada', 'Mantenimiento de registros y acuerdos', 'Estados de resultados depurados y verificados'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Ejecución Consistente del Plan de Crecimiento',
      checks: ['Resultados trimestrales predecibles', 'Incremento de ingresos y ganancias', 'Utilidades o beneficios trimestre tras trimestre'],
      selected: [false, false, false],
      score: null
    },
    {
      title: 'Proteger los Activos del Negocio',
      checks: ['Derechos sobre patentes, marcas registradas, y derechos de autor', 'Reconocimiento del Liderazgo de pensamiento', 'Producto o servicio únicos'],
      selected: [false, false, false],
      score: null
    }
  ];

  attributes: FinancingAttribute[] = [
    { descripcion: '', lider: '', trimestre: '' }
  ];

  addAttribute() {
    this.attributes.push({ descripcion: '', lider: '', trimestre: '' });
  }

  removeAttribute(index: number) {
    this.attributes.splice(index, 1);
  }

  save(): void {
    const atributosIncompletos = this.attributes.some(attr =>
      !attr.descripcion?.trim() || !attr.lider?.trim() || !attr.trimestre
    );

    const puntajesInvalidos = this.fundingItems.some(item =>
      item.score === null || item.score < 1 || item.score > 10
    );

    const formatoFinanciamiento = {
      // id_company: this.id_company,
      // created_by: this.user, // si tienes `this.user` definido
      evaluacion: this.fundingItems,
      atributos: this.attributes
    };

    console.log('Formato Financiamiento:', formatoFinanciamiento);

    // Simulación de promesa (reemplaza con tu servicio real si lo tienes)
    const promise: Promise<any> = Promise.resolve({ success: true });

    promise
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'El formato de Financiamiento se ha guardado correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch(error => {
        console.error('Error al guardar formato:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el formato. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }
}
