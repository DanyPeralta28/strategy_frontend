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

  saveDate() {
    if (!this.startDate) {
      alert('Por favor selecciona una fecha válida');
      return;
    }
    this.closeModal()

    // Generar semanas para todas las prioridades (o solo para la actual)
    for (let i = 0; i < this.priorities.length; i++) {
      this.generateWeeks(i);
    }
  }

  saveConfig() {
    console.log('⚙️ Selected view:', this.vistaModo);
    this.closeConfigModal();
  }

  toggleVistaAlcance() {
    this.vistaAlcance = this.vistaAlcance === 'individual' ? 'grupal' : 'individual';
  }

  kpisEditable = [
    { description: '', sv: '', v: '', r: '' }
  ];

  priorities: any[] = [];

  currentPriorityIndex = 0;
  qualitativeWeeks: any[][] = [];
  quantitativeWeeks: any[][] = [];

  estados = [
    { color: '#006600', placeholder: 'Número crítico' },
    { color: '#66CC66', placeholder: '' },
    { color: '#FFCC00', placeholder: 'Entre verde y rojo' },
    { color: '#CC0000', placeholder: '' }
  ];

  estados2 = [
    { color: '#006600', placeholder: 'Número crítico' },
    { color: '#66CC66', placeholder: '' },
    { color: '#FFCC00', placeholder: 'Entre verde y rojo' },
    { color: '#CC0000', placeholder: '' }
  ];

  coloresDisponibles = [
    { name: 'Super Verde', color: '#006600', textColor: 'white' },
    { name: 'Verde', color: '#66CC66', textColor: 'black' },
    { name: 'Amarillo', color: '#FFCC00', textColor: 'black' },
    { name: 'Rojo', color: '#CC0000', textColor: 'white' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // KPIs
      criticalNumberKpis: [''],
      superVerdeKpis: [''],
      verdeKpis: [''],
      amarilloKpis: [''],
      rojoKpis: [''],
      resultadoKpis: [''],
      colorKpis: [''],

      // Prioridades
      criticalNumberPriorities: [''],
      superVerdePriorities: [''],
      verdePriorities: [''],
      amarilloPriorities: [''],
      rojoPriorities: [''],
      resultadoPrioridades: [''],
      colorPrioridades: [''],
    });


    // grupal
    this.formGroupView = this.fb.group({
      criticalNumber: [''],
      superVerde: [''],
      verde: [''],
      amarillo: [''],
      rojo: [''],
      resultadoPrioridades: [''],
      colorPrioridades: [''],
    });

    this.loadQuarterPriorityFields();
  }

  ngOnInit() {
    this.loadInitialPriorities();
    for (let i = 0; i < this.priorities.length; i++) {
      this.generateWeeks(i);
    }
  }

  agregarKpi() {
    this.kpisEditable.push({ description: '', sv: '', v: '', r: '' });
  }

  eliminarKpi(index: number) {
    this.kpisEditable.splice(index, 1);
  }

  loadInitialPriorities(): void {
    this.priorities = [
      // Prioridades globales
      {
        name: 'Implementar nuevo CRM en el equipo de ventas',
        when: '2025-08-01',
        isIndividual: false,
        quien: 'Administrador'
      },
      {
        name: 'Optimizar tiempos de entrega en logística',
        when: '2025-08-05',
        isIndividual: false,
        quien: 'Administrador'
      },
      {
        name: 'Incrementar la satisfacción del cliente en un 20%',
        when: '2025-08-10',
        isIndividual: false,
        quien: 'Administrador'
      },

      // Prioridades individuales
      {
        name: 'Finalizar capacitación de liderazgo',
        when: '2025-08-15',
        isIndividual: true,
        quien: 'María García'
      },
      {
        name: 'Reducir errores en reportes financieros',
        when: '2025-08-20',
        isIndividual: true,
        quien: 'Carlos Méndez'
      },
      {
        name: 'Desarrollar módulo de reportes internos',
        when: '2025-08-25',
        isIndividual: true,
        quien: 'Daniel Peralta'
      }
    ];
  }

  addPriority(): void {
    this.priorities.push({
      name: '',
      when: '',
      isIndividual: true,
      quien: 'Usuario Actual' // Puedes reemplazar esto con el nombre del usuario autenticado
    });
  }

  removePriority(index: number): void {
    this.priorities.splice(index, 1);
  }

  get ganarJuegoKpis() {
    return this.form.get('ganarJuegoKpis') as FormArray;
  }

  get ganarJuegoPrioridades() {
    return this.form.get('ganarJuegoPrioridades') as FormArray;
  }

  get currentPriority() {
    return this.priorities[this.currentPriorityIndex];
  }

  get currentQualitativeWeeks() {
    return this.qualitativeWeeks[this.currentPriorityIndex] ?? [];
  }

  get currentQuantitativeWeeks() {
    return this.quantitativeWeeks[this.currentPriorityIndex] ?? [];
  }

  generateWeeks(index: number) {
    if (!this.startDate) return;

    const [year, month, day] = this.startDate.split('-').map(Number);
    const base = new Date(year, month - 1, day);

    const qualitative = Array.from({ length: 13 }, (_, i) => {
      const date = new Date(base);
      date.setDate(base.getDate() + i * 7);
      date.setHours(12, 0, 0, 0); // evita desfase por zona horaria

      return {
        week: i + 1,
        date,
        expectedResult: '',
        superGreen: '',
        green: '',
        red: '',
        result: '',
        color: ''
      };
    });

    const quantitative = Array.from({ length: 13 }, (_, i) => {
      const date = new Date(base);
      date.setDate(base.getDate() + i * 7);
      date.setHours(12, 0, 0, 0); // también aquí para evitar desfase

      return {
        week: i + 1,
        date,
        expectedResult: '',
        achieved: false,
        notAchieved: false
      };
    });

    this.qualitativeWeeks[index] = qualitative;
    this.quantitativeWeeks[index] = quantitative;
  }

  setCurrentPriorityIndex(index: number) {
    if (index >= 0 && index < this.priorities.length) {
      this.currentPriorityIndex = index;

      // Si no hay semanas generadas para esta prioridad, las generas (o simplemente aseguras que existan)
      if (!this.qualitativeWeeks[index]) {
        this.generateWeeks(index);
      }
    }
  }

  anteriorPrioridad() {
    this.setCurrentPriorityIndex(this.currentPriorityIndex - 1);
  }

  siguientePrioridad() {
    this.setCurrentPriorityIndex(this.currentPriorityIndex + 1);
  }

  getTextoColor(color: string): string {
    const found = this.coloresDisponibles.find(c => c.color === color);
    return found ? found.textColor : 'black';
  }

  getNombreColor(color: string): string {
    const found = this.coloresDisponibles.find(c => c.color === color);
    return found ? found.name : color;
  }

  save() {
    // KPIs
    const gameKpis = {
      criticalNumber: this.form.value.criticalNumberKpis,
      superGreen: this.form.value.superVerdeKpis,
      green: this.form.value.verdeKpis,
      yellow: this.form.value.amarilloKpis,
      red: this.form.value.rojoKpis,
      result: this.form.value.resultadoKpis,
      color: this.form.value.colorKpis,
      colorName: this.getNombreColor(this.form.value.colorKpis),
    };

    // Prioridades
    const gamePriorities = {
      criticalNumber: this.form.value.criticalNumberPriorities,
      superGreen: this.form.value.superVerdePriorities,
      green: this.form.value.verdePriorities,
      yellow: this.form.value.amarilloPriorities,
      red: this.form.value.rojoPriorities,
      result: this.form.value.resultadoPrioridades,
      color: this.form.value.colorPrioridades,
      colorName: this.getNombreColor(this.form.value.colorPrioridades),
    };

    // Vista Cualitativa (13 semanas)
    const qualitativeView = this.qualitativeWeeks.map((weeks, index) => ({
      priority: this.priorities[index].name,
      weeks: weeks.map(w => ({
        week: w.week,
        date: w.date,
        expectedResult: w.expectedResult,
        superGreen: w.superGreen,
        green: w.green,
        red: w.red,
        result: w.result,
        colorName: this.getNombreColor(w.color)
      }))
    }));

    // Vista Cuantitativa (13 semanas)
    const quantitativeView = this.quantitativeWeeks.map((weeks, index) => ({
      priority: this.priorities[index].name,
      weeks: weeks.map(w => ({
        week: w.week,
        date: w.date,
        expectedResult: w.expectedResult,
        achieved: w.achieved,
        notAchieved: w.notAchieved
      }))
    }));

    // Consola para verificar
    console.log('🎯 Game Plan - KPIs:', gameKpis);
    console.log('🎯 Game Plan - Priorities:', gamePriorities);
    console.log('📘 Qualitative View:', qualitativeView);
    console.log('📗 Quantitative View:', quantitativeView);
  }

  // GRUPAL

  filterType: 'team' | 'entity' = 'team';
  currentWeekIndex = 4;
  // filterType = 'team';

  groupPrioritiesDataQualt = [
    {
      user: 'Usuario 1',
      priorities: [
        {
          name: '100 Leads nuevos',
          week: 5,
          expectedResult: '30 leads',
          superGreen: 35,
          green: 30,
          red: 25,
          result: 28,
          color: '#66CC66',
        },
        {
          name: 'Campaña Ads',
          week: 5,
          expectedResult: '40 leads',
          superGreen: 35,
          green: 30,
          red: 25,
          result: 32,
          color: '#006600',
        },
        {
          name: 'Email Marketing',
          week: 5,
          expectedResult: 'Enviar 3 campañas',
          superGreen: 5,
          green: 4,
          red: 2,
          result: 3,
          color: '#FFCC00',
        },
        {
          name: 'Reuniones con equipo',
          week: 5,
          expectedResult: '2 reuniones estratégicas',
          superGreen: 3,
          green: 2,
          red: 1,
          result: 2,
          color: '#66CC66',
        },
        {
          name: 'Presentación a cliente',
          week: 5,
          expectedResult: 'Presentación comercial',
          superGreen: 1,
          green: 1,
          red: 0,
          result: 1,
          color: '#006600',
        }
      ]
    },
    {
      user: 'Usuario 2',
      priorities: [
        {
          name: 'Seguimiento CRM',
          week: 5,
          expectedResult: 'Llamar a 15 clientes',
          superGreen: 20,
          green: 15,
          red: 10,
          result: 12,
          color: '#FFCC00',
        },
        {
          name: 'Diseño de campaña',
          week: 5,
          expectedResult: '3 piezas gráficas',
          superGreen: 3,
          green: 2,
          red: 1,
          result: 2,
          color: '#66CC66',
        },
        {
          name: 'Email Marketing',
          week: 5,
          expectedResult: 'Enviar 3 campañas',
          superGreen: 5,
          green: 4,
          red: 2,
          result: 3,
          color: '#FFCC00',
        },
        {
          name: 'Reuniones con equipo',
          week: 5,
          expectedResult: '2 reuniones estratégicas',
          superGreen: 3,
          green: 2,
          red: 1,
          result: 2,
          color: '#66CC66',
        },
        {
          name: 'Presentación a cliente',
          week: 5,
          expectedResult: 'Presentación comercial',
          superGreen: 1,
          green: 1,
          red: 0,
          result: 1,
          color: '#006600',
        }
      ]
    }
  ];

  groupPrioritiesDataQuant = [
    {
      user: 'Usuario 1',
      priorities: [
        {
          name: '100 Leads nuevos',
          week: 5,
          expectedResult: '30 leads en redes sociales',
          achieved: true
        },
        {
          name: 'Campaña Ads',
          week: 5,
          expectedResult: '40 leads',
          achieved: true
        },
        {
          name: 'Email Marketing',
          week: 5,
          expectedResult: 'Enviar 3 campañas',
          achieved: false
        },
        {
          name: 'Reuniones con equipo',
          week: 5,
          expectedResult: '2 reuniones estratégicas',
          achieved: true
        },
        {
          name: 'Presentación a cliente',
          week: 5,
          expectedResult: 'Presentación comercial',
          achieved: true
        }
      ]
    },
    {
      user: 'Usuario 2',
      priorities: [
        {
          name: 'Seguimiento CRM',
          week: 5,
          expectedResult: 'Llamar a 15 clientes',
          achieved: false
        },
        {
          name: 'Diseño de campaña',
          week: 5,
          expectedResult: '3 piezas gráficas',
          achieved: true
        },
        {
          name: 'Email Marketing',
          week: 5,
          expectedResult: 'Enviar 3 campañas',
          achieved: false
        },
        {
          name: 'Reuniones con equipo',
          week: 5,
          expectedResult: '2 reuniones estratégicas',
          achieved: true
        },
        {
          name: 'Presentación a cliente',
          week: 5,
          expectedResult: 'Presentación comercial',
          achieved: true
        }
      ]
    }
  ];

  getPrioritiesForWeek(priorities: any[]) {
    const week = this.currentWeekIndex + 1;
    return priorities
      .filter(p => p.week === week)
      .map((p, index) => ({
        index: index + 1,
        ...p
      }));
  }

  getWeekStartDate(): Date {
    if (!this.startDate) return new Date();
    const baseDate = new Date(this.startDate);
    return new Date(baseDate.setDate(baseDate.getDate() + this.currentWeekIndex * 7));
  }

  getEndWeekDate(date: Date): Date {
    return new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  getWeekRange(index: number): string {
    const start = this.getWeekStartDate();
    const end = this.getEndWeekDate(start);
    return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })}`;
  }

  previousWeek() {
    if (this.currentWeekIndex > 0) this.currentWeekIndex--;
  }

  nextWeek() {
    if (this.currentWeekIndex < 12) this.currentWeekIndex++;
  }

  formGroupView: FormGroup;

  groupStates = [
    { color: '#006600', placeholder: 'Super Verde' },
    { color: '#66CC66', placeholder: 'Verde' },
    { color: '#FFCC00', placeholder: 'Entre verde y rojo' },
    { color: '#CC0000', placeholder: 'Rojo' },
  ];

  get gameQuarterPriorities(): FormArray {
    return this.formGroupView.get('gameQuarterPriorities') as FormArray;
  }

  loadQuarterPriorityFields(): void {
    if (!this.gameQuarterPriorities) return;

    this.groupStates.forEach(() => {
      this.gameQuarterPriorities.push(
        this.fb.group({ description: [''] })
      );
    });
  }

  showWeeklyConfigModal = false;

  weeklyMeetingDay: string = 'Friday'; // default
  weeklyMeetingTime: string = '09:00'; // default

  weekDays = [
    { value: 'Sunday', label: 'Domingo' },
    { value: 'Monday', label: 'Lunes' },
    { value: 'Tuesday', label: 'Martes' },
    { value: 'Wednesday', label: 'Miércoles' },
    { value: 'Thursday', label: 'Jueves' },
    { value: 'Friday', label: 'Viernes' },
    { value: 'Saturday', label: 'Sábado' }
  ];

  getNextMeetingDate(): string {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday ... 6 = Saturday
    const targetDay = this.weekDays.findIndex(d => d.value === this.weeklyMeetingDay);
    const daysUntilNext = (targetDay + 7 - currentDay) % 7 || 7;

    const nextMeeting = new Date(now);
    nextMeeting.setDate(now.getDate() + daysUntilNext);

    const [hours, minutes] = this.weeklyMeetingTime.split(':').map(Number);
    nextMeeting.setHours(hours, minutes, 0, 0);

    return nextMeeting.toLocaleString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  }


  // Abre el modal
  openMeetingConfigModal() {
    this.showWeeklyConfigModal = true;
  }

  // Cierra el modal
  closeMeetingConfigModal() {
    this.showWeeklyConfigModal = false;
  }

  closeWeeklyConfigModal() {
    this.showWeeklyConfigModal = false;
  }

  saveWeeklyConfig() {
    this.showWeeklyConfigModal = false;
    // Aquí podrías guardar en base de datos o localStorage si lo deseas
  }

  saveGroupQuarterGame(): void {
    const data = {
      criticalNumber: this.formGroupView.get('criticalNumber')?.value,
      superGreen: this.formGroupView.get('superVerde')?.value,
      green: this.formGroupView.get('verde')?.value,
      yellow: this.formGroupView.get('amarillo')?.value,
      red: this.formGroupView.get('rojo')?.value,
      resultPriority: this.formGroupView.get('resultadoPrioridades')?.value,
      colorPriority: this.getNombreColor(this.formGroupView.get('colorPrioridades')?.value)
    };

    console.log('🔵 Ganar el Juego Prioridades (Grupal)', data);
  }
}
