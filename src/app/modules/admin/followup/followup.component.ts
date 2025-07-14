import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-followup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './followup.component.html',
})
export class FollowupComponent {
  form: FormGroup;
  showModal = false;
  startDate: string | null = '2025-09-13';

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  showConfigModal = false;
  vistaModo: 'cuantitativa' | 'cualitativa' = 'cuantitativa';
  vistaAlcance: 'individual' | 'grupal' = 'individual';

  openConfigModal() { this.showConfigModal = true; }
  closeConfigModal() { this.showConfigModal = false; }

  saveDate(): void {
    if (this.startDate) {
      console.log('Fecha inicio seleccionada:', this.startDate);
      this.closeModal();
    }
  }

  saveConfig() {
    console.log('⚙️ Vista seleccionada:', this.vistaModo);
    this.closeConfigModal();
  }

  toggleVistaAlcance() {
    this.vistaAlcance = this.vistaAlcance === 'individual' ? 'grupal' : 'individual';
  }

  kpis = [
    {
      descripcion: 'Número de ventas semanales',
      sv: '100%',
      v: '80%',
      r: '20%'
    },
    {
      descripcion: 'Llamadas a clientes potenciales',
      sv: '50 llamadas',
      v: '30 llamadas',
      r: '20 llamadas'
    },
    {
      descripcion: 'Nivel de satisfacción del cliente',
      sv: '90%',
      v: '70%',
      r: '50%'
    }
  ];

  prioridades = [
    { nombre: 'Conseguir 100 leads', cuando: 'Julio 2025' },
    { nombre: 'Vender 10k', cuando: 'Agosto 2025' },
    { nombre: 'Finalizar campaña', cuando: 'Agosto 2025' },
    { nombre: 'Optimizar CRM', cuando: 'Septiembre 2025' },
    { nombre: 'Actualizar perfil LinkedIn', cuando: 'Septiembre 2025' }
  ];

  prioridadActualIndex = 0;
  semanasCualitativas: any[][] = [];
  semanasCuantitativas: any[][] = [];

  estados = [
    { color: '#006600', placeholder: 'Número crítico' },      // Verde oscuro
    { color: '#66CC66', placeholder: '' },                    // Verde claro
    { color: '#FFCC00', placeholder: 'Entre verde y rojo' },  // Amarillo
    { color: '#CC0000', placeholder: '' }
  ];

  estados2 = [
    { color: '#006600', placeholder: 'Número crítico' },      // Verde oscuro
    { color: '#66CC66', placeholder: '' },                    // Verde claro
    { color: '#FFCC00', placeholder: 'Entre verde y rojo' },  // Amarillo
    { color: '#CC0000', placeholder: '' }
  ];

  coloresDisponibles = [
    { nombre: 'Super Verde', color: '#006600', textColor: 'white' },
    { nombre: 'Verde', color: '#66CC66', textColor: 'black' },
    { nombre: 'Amarillo', color: '#FFCC00', textColor: 'black' },
    { nombre: 'Rojo', color: '#CC0000', textColor: 'white' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // KPIs
      ganarJuegoKpis: this.fb.array([
        this.fb.group({ descripcion: [''] }),
        this.fb.group({ descripcion: [''] }),
        this.fb.group({ descripcion: [''] }),
        this.fb.group({ descripcion: [''] }),
      ]),
      resultadoKpis: [''],
      colorKpis: [''],

      // Prioridades
      ganarJuegoPrioridades: this.fb.array([
        this.fb.group({ descripcion: [''] }),
        this.fb.group({ descripcion: [''] }),
        this.fb.group({ descripcion: [''] }),
        this.fb.group({ descripcion: [''] }),
      ]),
      resultadoPrioridades: [''],
      colorPrioridades: ['']
    });
  }

  ngOnInit() {
    for (let i = 0; i < this.prioridades.length; i++) {
      this.generarSemanas(i); // ⬅️ le pasamos el índice
    }
  }

  get ganarJuegoKpis() {
    return this.form.get('ganarJuegoKpis') as FormArray;
  }

  get ganarJuegoPrioridades() {
    return this.form.get('ganarJuegoPrioridades') as FormArray;
  }

  get prioridadActual() {
    return this.prioridades[this.prioridadActualIndex];
  }

  get semanasCualitativaActual() {
    return this.semanasCualitativas[this.prioridadActualIndex] ?? [];
  }

  get semanasCuantitativaActual() {
    return this.semanasCuantitativas[this.prioridadActualIndex] ?? [];
  }

  generarSemanas(index: number) {
    const fechaInicio = new Date(this.startDate || new Date());

    const semanasCualitativa = Array.from({ length: 13 }, (_, i) => {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i * 7);
      return {
        semana: i + 1,
        fecha,
        resultadoEsperado: '',
        superVerde: '',
        verde: '',
        rojo: '',
        resultado: '',
        color: ''
      };
    });

    const semanasCuantitativa = Array.from({ length: 13 }, (_, i) => {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i * 7);
      return {
        semana: i + 1,
        fecha,
        resultadoEsperado: '',
        logrado: false,
        noLogrado: false
      };
    });

    this.semanasCualitativas[index] = semanasCualitativa;
    this.semanasCuantitativas[index] = semanasCuantitativa;
  }

  anteriorPrioridad() {
    if (this.prioridadActualIndex > 0) {
      this.prioridadActualIndex--;
    }
  }

  siguientePrioridad() {
    if (this.prioridadActualIndex < this.prioridades.length - 1) {
      this.prioridadActualIndex++;
    }
  }

  getTextoColor(color: string): string {
    const encontrado = this.coloresDisponibles.find(c => c.color === color);
    return encontrado ? encontrado.textColor : 'black';
  }

  getNombreColor(color: string): string {
    const encontrado = this.coloresDisponibles.find(c => c.color === color);
    return encontrado ? encontrado.nombre : color;
  }

  save() {
    const juegoKpis = this.form.value.ganarJuegoKpis.map((item: any, index: number) => ({
      color: this.form.value.colorKpis,
      descripcion: item.descripcion
    }));

    const juegoPrioridades = this.form.value.ganarJuegoPrioridades.map((item: any, index: number) => ({
      color: this.form.value.colorPrioridades,
      descripcion: item.descripcion
    }));

    const resultadoKpis = this.form.value.resultadoKpis;
    const colorKpis = this.form.value.colorKpis;
    const resultadoPrioridades = this.form.value.resultadoPrioridades;
    const colorPrioridades = this.form.value.colorPrioridades;

    const cualitativa = this.semanasCualitativas.map((semanas, index) => ({
      prioridad: this.prioridades[index].nombre,
      semanas: semanas.map(s => ({
        semana: s.semana,
        fecha: s.fecha,
        resultadoEsperado: s.resultadoEsperado,
        superVerde: s.superVerde,
        verde: s.verde,
        rojo: s.rojo,
        resultado: s.resultado,
        color: this.getNombreColor(s.color)
      }))
    }));

    const cuantitativa = this.semanasCuantitativas.map((semanas, index) => ({
      prioridad: this.prioridades[index].nombre,
      semanas: semanas.map(s => ({
        semana: s.semana,
        fecha: s.fecha,
        resultadoEsperado: s.resultadoEsperado,
        logrado: s.logrado,
        noLogrado: s.noLogrado
      }))
    }));

    console.log('🎯 Ganar el Juego - KPIs:', juegoKpis);
    console.log('📊 Resultado KPIs:', resultadoKpis);
    console.log('🎨 Color KPIs:', colorKpis);

    console.log('🎯 Ganar el Juego - Prioridades:', juegoPrioridades);
    console.log('📊 Resultado Prioridades:', resultadoPrioridades);
    console.log('🎨 Color Prioridades:', colorPrioridades);

    console.log('📘 Vista Cualitativa:', cualitativa);
    console.log('📗 Vista Cuantitativa:', cuantitativa);
  }
}