import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { FollowupService } from '../services/followup.service';

@Component({
  selector: 'app-followup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './followup.component.html',
})
export class FollowupComponent {
  id_company = 'BANRURAL_GT99';
  id_entity = 'SUCURSAL_001';
  team = 'marketing';
  created_by = { username: 'admin', role: 'coordinator' };
  existingPriorityWeekId: number | null = null;

  form: FormGroup;
  showModal = false;
  startDate: string | null = null;

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  showConfigModal = false;
  vistaModo: 'cuantitativa' | 'cualitativa' = 'cuantitativa';
  vistaAlcance: 'individual' | 'grupal' = 'individual';
  private existingStartWeekId: number | null = null;

  openConfigModal() { this.showConfigModal = true; }
  closeConfigModal() { this.showConfigModal = false; }

  saveDate() {
    if (!this.startDate) {
      alert('Por favor selecciona una fecha válida');
      return;
    }
    this.closeModal()

    for (let i = 0; i < this.priorities.length; i++) this.generateWeeks(i);
    this.upsertStartWeek({ date_start: this.startDate });
  }

  private viewToId(view: 'cuantitativa' | 'cualitativa') { return view === 'cuantitativa' ? 1 : 2; }

  saveConfig() {
    console.log('⚙️ Selected view:', this.vistaModo);
    this.closeConfigModal();
    this.upsertStartWeek({ id_view_list: this.viewToId(this.vistaModo) });
  }

  toggleVistaAlcance() {
    this.vistaAlcance = this.vistaAlcance === 'individual' ? 'grupal' : 'individual';
    this.loadWeeklyDateTime();
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

  constructor(private fb: FormBuilder, private followupService: FollowupService) {
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

  async ngOnInit() {
    this.loadInitialPriorities();
    await this.loadStartWeekByCompany();
    for (let i = 0; i < this.priorities.length; i++) {
      this.generateWeeks(i);
    }
    this.loadPriorityWeekByCompany();
  }

  private async loadStartWeekByCompany(): Promise<void> {
    try {
      // 1) Llamada al endpoint
      const resp = await this.followupService.getStartWeekById(this.id_company);

      // 2) El backend devuelve data como array; tomamos el primer registro (si existe)
      const list = Array.isArray(resp?.data) ? resp.data : [];
      const item = list[0];

      // 3) Si NO hay registro => dejar todo limpio y salir
      if (!item) {
        this.existingStartWeekId = undefined;
        this.startDate = null;
        this.vistaModo = 'cuantitativa';
        this.qualitativeWeeks = [];
        this.quantitativeWeeks = [];
        return;
      }

      // 4) Hay registro → guardamos el id para futuros PUT
      this.existingStartWeekId = Number(item.id);

      // 5) Normalizamos la fecha a 'YYYY-MM-DD' (por si viene con hora/ISO)
      const normalizeDate = (d: any): string | null => {
        if (!d) return null;
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d; // ya viene limpia
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return null;
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      this.startDate = normalizeDate(item.date_start);

      // 6) Modo de vista: 1 = cuantitativa, 2 = cualitativa (ajusta si tu backend usa otros valores)
      const view = Number(item.id_view_list);
      this.vistaModo = view === 2 ? 'cualitativa' : 'cuantitativa';

      // 7) Si hay fecha, regeneramos las 13 semanas para cada prioridad
      if (this.startDate) {
        this.qualitativeWeeks = [];
        this.quantitativeWeeks = [];
        for (let i = 0; i < this.priorities.length; i++) {
          this.generateWeeks(i);
        }
      } else {
        // Sin fecha → limpiamos semanas
        this.qualitativeWeeks = [];
        this.quantitativeWeeks = [];
      }
    } catch (err) {
      console.error('Error al cargar StartWeek:', err);
      // En caso de error, dejamos el estado en "no configurado"
      this.existingStartWeekId = undefined;
      this.startDate = null;
      this.vistaModo = 'cuantitativa';
      this.qualitativeWeeks = [];
      this.quantitativeWeeks = [];
    }
  }

  private async upsertStartWeek(partial?: { date_start?: string; id_view_list?: number }): Promise<void> {
    const body = {
      date_start: partial?.date_start ?? this.startDate ?? '',
      id_view_list: partial?.id_view_list ?? this.viewToId(this.vistaModo),
      id_company: this.id_company,
      id_entity: this.id_entity,
      status: 1,
      created_by: this.created_by,
    };

    try {
      if (this.existingStartWeekId) {
        await this.followupService.updateStartWeek(this.existingStartWeekId, {
          date_start: body.date_start,
          id_view_list: body.id_view_list,
          status: body.status,
          created_by: body.created_by,
        });
      } else {
        const resp = await this.followupService.createStartWeek(body);
        const newId = resp?.data?.id ?? resp?.id;
        if (newId != null) this.existingStartWeekId = Number(newId);
      }
    } catch (e) {
      console.error('Error guardando start-week:', e);
    }
  }

  private async loadPriorityWeekByCompany(): Promise<void> {
    try {
      const resp = await this.followupService.getPriorityWeekById(this.id_company);

      const raw = resp?.data;
      const data = Array.isArray(raw) ? raw[0] : raw;
      if (!data) return;

      if (data.id != null) this.existingPriorityWeekId = Number(data.id);

      // ---------- KPIs ----------
      this.kpisEditable = Array.isArray(data.kpi_list) && data.kpi_list.length
        ? data.kpi_list.map((k: any) => ({
          description: k.description ?? '',
          sv: k.sv ?? '',
          v: k.v ?? '',
          r: k.r ?? '',
        }))
        : [{ description: '', sv: '', v: '', r: '' }];

      // ---------- Prioridades (trimestrales) ----------
      this.priorities = Array.isArray(data.quarter_priority_list)
        ? data.quarter_priority_list.map((p: any) => ({
          name: p.name ?? '',
          when: p.when ?? '',
          isIndividual: !!p.isIndividual,
          quien: p.quien ?? '',
        }))
        : [];

      if (!this.priorities.length) {
        // Al menos una fila editable si no hay nada
        this.priorities.push({ name: '', when: '', isIndividual: true, quien: 'Usuario Actual' });
      }

      // ---------- Ganar el juego (KPIs) ----------
      this.form.patchValue({
        superVerdeKpis: data.game_green_kpi ?? '',
        verdeKpis: data.game_lemon_kpi ?? '',
        amarilloKpis: data.game_yellow_kpi ?? '',
        rojoKpis: data.game_red_kpi ?? '',
        resultadoKpis: data.game_result_kpi ?? '',
        colorKpis: this.mapTagToHex(data.game_color_kpi ?? ''),
      });

      // ---------- Ganar el juego (Prioridades) ----------
      this.form.patchValue({
        superVerdePriorities: data.game_green_priority ?? '',
        verdePriorities: data.game_lemon_priority ?? '',
        amarilloPriorities: data.game_yellow_priority ?? '',
        rojoPriorities: data.game_red_priority ?? '',
        resultadoPrioridades: data.game_result_priority ?? '',
        colorPrioridades: this.mapTagToHex(data.game_color_priority ?? ''),
      });

      // ---------- Semanas (cualitativa / cuantitativa) ----------
      this.qualitativeWeeks = [];
      this.quantitativeWeeks = [];

      const qualFromBe = Array.isArray(data.priority_list_quality) ? data.priority_list_quality : [];
      const quantFromBe = Array.isArray(data.priority_list_quantity) ? data.priority_list_quantity : [];

      // mapear por prioridad
      this.priorities.forEach((prio, idx) => {
        // Cualitativa
        const q = qualFromBe.find((x: any) => (x.priority || x.name) === prio.name);
        if (q?.weeks?.length) {
          this.qualitativeWeeks[idx] = q.weeks.map((w: any, i: number) => ({
            week: w.week ?? i + 1,
            date: w.date ? new Date(w.date) : undefined,
            expectedResult: w.expectedResult ?? '',
            superGreen: w.superGreen ?? '',
            green: w.green ?? '',
            red: w.red ?? '',
            result: w.result ?? '',
            color: this.mapTagToHex2(w.colorName),
          }));
        } else if (this.startDate) {
          this.generateWeeks(idx);
        } else {
          this.qualitativeWeeks[idx] = [];
        }
        // Cuantitativa
        const Q = quantFromBe.find((x: any) => (x.priority || x.name) === prio.name);
        if (Q?.weeks?.length) {
          this.quantitativeWeeks[idx] = Q.weeks.map((w: any, i: number) => ({
            week: w.week ?? i + 1,
            date: w.date ? new Date(w.date) : undefined,
            expectedResult: w.expectedResult ?? '',
            achieved: !!w.achieved,
            notAchieved: !!w.notAchieved,
          }));
        } else if (this.startDate) {
          this.generateWeeks(idx);
        } else {
          this.quantitativeWeeks[idx] = [];
        }
      });

      this.currentPriorityIndex = 0;
    } catch (err) {
      console.error('Error cargando PriorityWeek:', err);
    }
  }

  private mapHexToTag(hex?: string): 'green' | 'lemon' | 'yellow' | 'red' | '' {
    switch ((hex || '').toLowerCase()) {
      case '#006600': return 'green';  // Super Verde
      case '#66cc66': return 'lemon';  // Verde
      case '#ffcc00': return 'yellow'; // Amarillo
      case '#cc0000': return 'red';    // Rojo
      default: return '';
    }
  }

  private mapTagToHex(tag?: string): string {
    switch ((tag || '').toLowerCase()) {
      case 'green': return '#006600';
      case 'lemon': return '#66CC66';
      case 'yellow': return '#FFCC00';
      case 'red': return '#CC0000';
      default: return '';
    }
  }

  private mapTagToHex2(tag?: string): string {
    switch (tag) {
      case 'Super Verde': return '#006600';
      case 'Verde': return '#66CC66';
      case 'Amarillo': return '#FFCC00';
      case 'Rojo': return '#CC0000';
      default: return '';
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
      // // Prioridades globales
      // {
      //   name: 'Implementar nuevo CRM en el equipo de ventas',
      //   when: '2025-08-01',
      //   isIndividual: false,
      //   quien: 'Administrador'
      // },
      // {
      //   name: 'Optimizar tiempos de entrega en logística',
      //   when: '2025-08-05',
      //   isIndividual: false,
      //   quien: 'Administrador'
      // },
      // {
      //   name: 'Incrementar la satisfacción del cliente en un 20%',
      //   when: '2025-08-10',
      //   isIndividual: false,
      //   quien: 'Administrador'
      // },

      // // Prioridades individuales
      // {
      //   name: 'Finalizar capacitación de liderazgo',
      //   when: '2025-08-15',
      //   isIndividual: true,
      //   quien: 'María García'
      // },
      // {
      //   name: 'Reducir errores en reportes financieros',
      //   when: '2025-08-20',
      //   isIndividual: true,
      //   quien: 'Carlos Méndez'
      // },
      // {
      //   name: 'Desarrollar módulo de reportes internos',
      //   when: '2025-08-25',
      //   isIndividual: true,
      //   quien: 'Daniel Peralta'
      // }
    ];
  }

  addPriority(): void {
    this.priorities.push({
      name: '',
      when: '',
      isIndividual: true,
      quien: 'Usuario Actual' // Puedes reemplazar esto con el nombre del usuario autenticado
    });

    const newIdx = this.priorities.length - 1;
    if (this.startDate) this.generateWeeks(newIdx);
  }

  removePriority(index: number): void {
    this.priorities.splice(index, 1);
    this.qualitativeWeeks.splice(index, 1);
    this.quantitativeWeeks.splice(index, 1);

    if (this.currentPriorityIndex >= this.priorities.length) {
      this.currentPriorityIndex = Math.max(0, this.priorities.length - 1);
    }
  }

  private ensureWeeksForAll(): void {
    if (!this.startDate) return;
    for (let i = 0; i < this.priorities.length; i++) {
      if (!this.qualitativeWeeks[i] || !this.quantitativeWeeks[i]) {
        this.generateWeeks(i);
      }
    }
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

  async save(): Promise<void> {
    this.ensureWeeksForAll();

    // 1) Construir vistas 13 semanas
    const qualitativeView = this.qualitativeWeeks.map((weeks, idx) => ({
      priority: this.priorities[idx]?.name ?? '',
      weeks: weeks.map(w => ({
        week: w.week,
        date: w.date,
        expectedResult: w.expectedResult,
        superGreen: w.superGreen,
        green: w.green,
        red: w.red,
        result: w.result,
        colorName: this.getNombreColor(w.color),
      })),
    }));

    const quantitativeView = this.quantitativeWeeks.map((weeks, idx) => ({
      priority: this.priorities[idx]?.name ?? '',
      weeks: weeks.map(w => ({
        week: w.week,
        date: w.date,
        expectedResult: w.expectedResult,
        achieved: !!w.achieved,
        notAchieved: !!w.notAchieved,
      })),
    }));

    // 2) KPI list
    const kpi_list = this.kpisEditable.map(k => ({
      description: k.description ?? '',
      sv: k.sv ?? '',
      v: k.v ?? '',
      r: k.r ?? '',
    }));

    // 3) Prioridades trimestrales
    const quarter_priority_list = this.priorities.map(p => ({
      name: p.name ?? '',
      when: p.when ?? '',
      isIndividual: !!p.isIndividual,
      quien: p.quien ?? '',
    }));

    // 4) Ganar el juego - KPIs
    const game_green_kpi = this.form.value.superVerdeKpis ?? '';
    const game_lemon_kpi = this.form.value.verdeKpis ?? '';
    const game_yellow_kpi = this.form.value.amarilloKpis ?? '';
    const game_red_kpi = this.form.value.rojoKpis ?? '';
    const game_result_kpi = this.form.value.resultadoKpis ?? '';
    const game_color_kpi = this.mapHexToTag(this.form.value.colorKpis);

    // 5) Ganar el juego - Prioridades
    const game_green_priority = this.form.value.superVerdePriorities ?? '';
    const game_lemon_priority = this.form.value.verdePriorities ?? '';
    const game_yellow_priority = this.form.value.amarilloPriorities ?? '';
    const game_red_priority = this.form.value.rojoPriorities ?? '';
    const game_result_priority = this.form.value.resultadoPrioridades ?? '';
    const game_color_priority = this.mapHexToTag(this.form.value.colorPrioridades);

    // 6) Payloads
    const createPayload = {
      priority_list_quality: qualitativeView,
      priority_list_quantity: quantitativeView,
      kpi_list,
      quarter_priority_list,
      game_green_kpi,
      game_lemon_kpi,
      game_yellow_kpi,
      game_red_kpi,
      game_result_kpi,
      game_color_kpi,
      game_green_priority,
      game_lemon_priority,
      game_yellow_priority,
      game_red_priority,
      game_result_priority,
      game_color_priority,
      id_company: this.id_company,
      id_entity: this.id_entity,
      team: this.team,
      status: 1,
      created_by: this.created_by,
    };

    const updatePayload = {
      priority_list_quality: qualitativeView,
      priority_list_quantity: quantitativeView,
      kpi_list,
      quarter_priority_list,
      game_green_kpi,
      game_lemon_kpi,
      game_yellow_kpi,
      game_red_kpi,
      game_result_kpi,
      game_color_kpi,
      game_green_priority,
      game_lemon_priority,
      game_yellow_priority,
      game_red_priority,
      game_result_priority,
      game_color_priority,
      team: this.team,
      status: 1,
      created_by: this.created_by,
    };

    Swal.fire({
      title: this.existingPriorityWeekId ? 'Actualizando...' : 'Guardando...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    try {
      if (this.existingPriorityWeekId != null) {
        await this.followupService.updatePriorityWeek(this.existingPriorityWeekId, updatePayload);
        Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'Seguimiento guardado correctamente.', confirmButtonColor: '#003660' });
      } else {
        const res = await this.followupService.createPriorityWeek(createPayload);
        const newId = res?.data?.id ?? res?.id;
        if (newId != null) this.existingPriorityWeekId = Number(newId);
        Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Seguimiento creado correctamente.', confirmButtonColor: '#003660' });
      }
    } catch (err) {
      console.error('Error guardando PriorityWeek:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el seguimiento.', confirmButtonColor: '#D32F2F' });
    }
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

  showWeeklyConfigModal = false;

  weeklyMeetingDay: string = 'Friday';
  weeklyMeetingTime: string = '09:00';

  weekDays = [
    { value: 'Sunday', label: 'Domingo' },
    { value: 'Monday', label: 'Lunes' },
    { value: 'Tuesday', label: 'Martes' },
    { value: 'Wednesday', label: 'Miércoles' },
    { value: 'Thursday', label: 'Jueves' },
    { value: 'Friday', label: 'Viernes' },
    { value: 'Saturday', label: 'Sábado' }
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

  loadQuarterPriorityFields(): void {
    if (!this.gameQuarterPriorities) return;

    this.groupStates.forEach(() => {
      this.gameQuarterPriorities.push(
        this.fb.group({ description: [''] })
      );
    });
  }

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

  loadWeeklyDateTime() {
    this.followupService
      .getGroupControlById(this.id_company)
      .then(weekly => {
        
        console.log("weekly recibido:", new Date(weekly.data[0].date_time_weekly));
      })
      .catch(err => {
        console.error("Error cargando weekly:", err);
      });
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
    console.log(this.weeklyMeetingDay)
    console.log(this.weeklyMeetingTime)
    const dateCalculated = this.getNextMeetingDate();
    console.log(dateCalculated);

    this.showWeeklyConfigModal = false;
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
