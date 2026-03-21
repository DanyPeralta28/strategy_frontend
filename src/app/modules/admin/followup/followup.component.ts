import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { FollowupService } from '../services/followup.service';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

interface FilterEntityOption { id: number | string; name: string; }
interface FilterUserOption { id: number | string; name: string; }
interface IndividualPdfWeekRow {
  user: string;
  priority: string;
  week: number | string;
  date: Date | string | null;
  expectedResult: string;
  superGreen?: string;
  green?: string;
  red?: string;
  result?: string;
  color?: string;
  achieved?: boolean;
  notAchieved?: boolean;
}
interface GroupPdfWeekRow {
  user: string;
  priority: string;
  week: number | string;
  expectedResult: string;
  viewType?: number;
  superGreen?: string;
  green?: string;
  red?: string;
  result?: string;
  color?: string;
  achieved?: boolean;
  notAchieved?: boolean;
}

type PriorityViewId = 1 | 2;

@Component({
  selector: 'app-followup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
  templateUrl: './followup.component.html',
})
export class FollowupComponent {
  @ViewChild('individualExportContent') individualExportContent?: ElementRef<HTMLElement>;
  @ViewChild('individualPdfExportContent') individualPdfExportContent?: ElementRef<HTMLElement>;
  @ViewChild('groupExportContent') groupExportContent?: ElementRef<HTMLElement>;
  @ViewChild('groupPdfExportContent') groupPdfExportContent?: ElementRef<HTMLElement>;
  id_company = getSessionCompanyId();
  id_entity = getSessionEntityId();
  team = getSessionTeam();
  created_by = getSessionUserId();
  existingPriorityWeekId: number | null = null;
  individualPriorityWeekRaw: any = null;

  form: FormGroup;
  showModal = false;
  startDate: string | null = null;

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  showConfigModal = false;
  vistaModo: 'cuantitativa' | 'cualitativa' = 'cuantitativa';
  vistaAlcance: 'individual' | 'grupal' = 'individual';
  private existingStartWeekId: number | null = null;
  groupFilteredResponse: any = null;
  activeGroupTab: 'leaders' | 'companions' = 'leaders';
  entidades: FilterEntityOption[] = [];
  equipos: string[] = [];
  usuariosFiltro: FilterUserOption[] = [];
  selectedEntidad: number | string | null = null;
  selectedEquipo: string | null = null;
  selectedUsuario: number | string | null = null;
  groupEntidades: FilterEntityOption[] = [];
  groupEquipos: string[] = [];
  selectedGroupEntidad: number | string | null = null;
  selectedGroupEquipo: string | null = null;

  openConfigModal() { this.showConfigModal = true; }
  closeConfigModal() { this.showConfigModal = false; }

  saveDate() {
    if (!this.startDate) {
      alert('Por favor selecciona una fecha válida');
      return;
    }
    this.closeModal()

    for (let i = 0; i < this.priorities.length; i++) this.generateWeeks(i);
    this.currentWeekIndex = this.getClosestWeekIndexFromStartDate();
    this.upsertStartWeek({ date_start: this.startDate });
  }

  private viewToId(view: 'cuantitativa' | 'cualitativa') { return view === 'cuantitativa' ? 1 : 2; }

  saveConfig() {
    console.log('⚙️ Selected view:', this.vistaModo);
    this.closeConfigModal();
    this.upsertStartWeek({ id_view_list: this.viewToId(this.vistaModo) });
    if (this.vistaAlcance === 'grupal') {
      this.loadPriorityWeeksFiltered();
    }
  }

  toggleVistaAlcance() {
    this.vistaAlcance = this.vistaAlcance === 'individual' ? 'grupal' : 'individual';
    // this.loadWeeklyDateTime();
    if (this.vistaAlcance === 'grupal') {
      this.loadPriorityWeeksFiltered();
    }
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
    await this.loadEntitiesForIndividualView();
    if (this.isLevelUserTwo) {
      await this.loadEntitiesForGroupView();
    }
    await this.loadStartWeekByCompany();
    for (let i = 0; i < this.priorities.length; i++) {
      this.generateWeeks(i);
    }
    this.loadPriorityWeekByCompany();
  }

  private get currentEntityId(): number | string {
    return this.selectedEntidad ?? this.id_entity;
  }

  private get currentTeam(): string {
    return this.selectedEquipo ?? this.team;
  }

  private get currentUserId(): number | string {
    return this.selectedUsuario ?? this.created_by;
  }

  get selectedEntityName(): string {
    const found = this.entidades.find(e => String(e.id) === String(this.currentEntityId));
    return found?.name || String(this.currentEntityId ?? '');
  }

  get selectedUserName(): string {
    const found = this.usuariosFiltro.find(u => String(u.id) === String(this.currentUserId));
    return found?.name || String(this.currentUserId ?? '');
  }

  get reportModeLabel(): string {
    return 'Seguimiento por prioridad';
  }

  get isLevelUserTwo(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  getPriorityTypeLabel(priority: any): string {
    return priority?.isIndividual ? 'Prioridad individual' : 'Prioridad de vision';
  }

  get activeGroupDatasetLabel(): string {
    return this.activeGroupTab === 'companions' ? 'Compañeros' : 'Equipo que lidero';
  }

  get currentGroupEntityId(): number | string {
    return this.selectedGroupEntidad ?? this.id_entity;
  }

  get currentGroupTeam(): string {
    return this.selectedGroupEquipo ?? this.team;
  }

  get selectedGroupEntityName(): string {
    const found = this.groupEntidades.find(e => String(e.id) === String(this.currentGroupEntityId));
    return found?.name || String(this.currentGroupEntityId ?? '');
  }

  get activeGroupUsersForView(): any[] {
    return this.activeGroupTab === 'companions' ? this.groupCompanionsData : this.groupPrioritiesData;
  }

  get groupPdfWeekRows(): GroupPdfWeekRow[] {
    return this.activeGroupUsersForView.flatMap((user: any) =>
      (Array.isArray(user?.priorities) ? user.priorities : []).map((priority: any) => ({
        user: user?.user || '',
        priority: priority?.name || '',
        week: priority?.week ?? '',
        expectedResult: priority?.expectedResult || '',
        superGreen: priority?.superGreen || '',
        green: priority?.green || '',
        red: priority?.red || '',
        result: priority?.result || '',
        color: priority?.color ? this.getNombreColor(priority.color) : '',
        achieved: !!priority?.achieved,
        notAchieved: !!priority?.notAchieved,
        viewType: Number(priority?.viewType) === 2 ? 2 : 1,
      }))
    );
  }

  get individualPdfWeekRows(): IndividualPdfWeekRow[] {
    const user = this.selectedUserName;
    const unified = Array.isArray(this.individualPriorityWeekRaw?.priority_list_view)
      ? this.individualPriorityWeekRaw.priority_list_view
      : [];

    if (unified.length) {
      return unified.flatMap((priority: any) => {
        const viewId = Number(priority?.id_view_list ?? priority?.viewType ?? priority?.idViewList ?? 1) === 2 ? 2 : 1;
        return (Array.isArray(priority?.weeks) ? priority.weeks : []).map((semana: any, index: number) => ({
          user,
          priority: priority?.priority || priority?.name || '',
          week: semana?.week ?? index + 1,
          date: semana?.date ? new Date(semana.date) : null,
          expectedResult: semana?.expectedResult || '',
          ...(viewId === 2
            ? {
                superGreen: semana?.superGreen || '',
                green: semana?.green || '',
                red: semana?.red || '',
                result: semana?.result || '',
                color: semana?.colorName || this.getNombreColor(semana?.color || ''),
              }
            : {
                achieved: !!semana?.achieved,
                notAchieved: !!semana?.notAchieved,
              }),
        }));
      });
    }

    if (this.vistaModo === 'cualitativa') {
      const source = Array.isArray(this.individualPriorityWeekRaw?.priority_list_quality)
        ? this.individualPriorityWeekRaw.priority_list_quality
        : [];

      if (source.length) {
        return source.flatMap((priority: any) =>
          (Array.isArray(priority?.weeks) ? priority.weeks : []).map((semana: any, index: number) => ({
            user,
            priority: priority?.priority || priority?.name || '',
            week: semana?.week ?? index + 1,
            date: semana?.date ? new Date(semana.date) : null,
            expectedResult: semana?.expectedResult || '',
            superGreen: semana?.superGreen || '',
            green: semana?.green || '',
            red: semana?.red || '',
            result: semana?.result || '',
            color: semana?.colorName || this.getNombreColor(semana?.color || ''),
          }))
        );
      }

      return this.priorities.flatMap((priority, index) =>
        (this.qualitativeWeeks[index] ?? []).map((semana: any) => ({
          user,
          priority: priority?.name || '',
          week: semana?.week ?? '',
          date: semana?.date ?? null,
          expectedResult: semana?.expectedResult || '',
          superGreen: semana?.superGreen || '',
          green: semana?.green || '',
          red: semana?.red || '',
          result: semana?.result || '',
          color: this.getNombreColor(semana?.color || ''),
        }))
      );
    }

    const source = Array.isArray(this.individualPriorityWeekRaw?.priority_list_quantity)
      ? this.individualPriorityWeekRaw.priority_list_quantity
      : [];

    if (source.length) {
      return source.flatMap((priority: any) =>
        (Array.isArray(priority?.weeks) ? priority.weeks : []).map((semana: any, index: number) => ({
          user,
          priority: priority?.priority || priority?.name || '',
          week: semana?.week ?? index + 1,
          date: semana?.date ? new Date(semana.date) : null,
          expectedResult: semana?.expectedResult || '',
          achieved: !!semana?.achieved,
          notAchieved: !!semana?.notAchieved,
        }))
      );
    }

    return this.priorities.flatMap((priority, index) =>
      (this.quantitativeWeeks[index] ?? []).map((semana: any) => ({
        user,
        priority: priority?.name || '',
        week: semana?.week ?? '',
        date: semana?.date ?? null,
        expectedResult: semana?.expectedResult || '',
        achieved: !!semana?.achieved,
        notAchieved: !!semana?.notAchieved,
      }))
    );
  }

  async loadEntitiesForIndividualView(): Promise<void> {
    try {
      const resp = await this.followupService.getEntitiesByCompany(this.id_company);
      const rows = Array.isArray(resp?.data) ? resp.data : [];
      this.entidades = rows
        .map((r: any) => ({
          id: r?.id_entity ?? r?.entity_id ?? r?.id,
          name: (r?.name_entity ?? r?.entity_name ?? r?.name ?? '').toString().trim(),
        }))
        .filter((x: FilterEntityOption) => x.id != null && !!x.name);

      const defaultEntity = this.entidades.find(e => String(e.id) === String(this.id_entity));
      if (defaultEntity) {
        this.selectedEntidad = defaultEntity.id;
      }

      await this.onEntidadFilterChange();
    } catch (err) {
      console.error('Error cargando entidades de Follow up:', err);
      this.entidades = [];
    }
  }

  async onEntidadFilterChange(): Promise<void> {
    this.selectedEquipo = null;
    this.selectedUsuario = null;
    this.equipos = [];
    this.usuariosFiltro = [];

    if (this.selectedEntidad == null || this.selectedEntidad === '') return;

    try {
      const resp = await this.followupService.getTeamMembersByEntity(
        this.created_by,
        this.selectedEntidad,
        this.id_company
      );
      const rows = Array.isArray(resp?.data) ? resp.data : [];
      this.equipos = rows
        .map((r: any) => (typeof r === 'string' ? r : r?.team ?? r?.team_name ?? r?.name ?? ''))
        .map((x: any) => x.toString().trim())
        .filter(Boolean);

      const defaultTeam = this.equipos.find(team => team === this.team);
      if (defaultTeam) {
        this.selectedEquipo = defaultTeam;
      }

      await this.onEquipoFilterChange();
    } catch (err) {
      console.error('Error cargando equipos de Follow up:', err);
      this.equipos = [];
    }
  }

  async onEquipoFilterChange(): Promise<void> {
    this.selectedUsuario = null;
    this.usuariosFiltro = [];

    if (this.selectedEntidad == null || this.selectedEntidad === '' || !this.selectedEquipo) return;

    try {
      const resp = await this.followupService.getTeamMembersByTeam(
        this.selectedEquipo,
        this.selectedEntidad,
        this.id_company
      );
      const rows = Array.isArray(resp?.data) ? resp.data : [];
      this.usuariosFiltro = rows
        .map((u: any) => {
          const id = u?.id_user ?? u?.user_id ?? u?.id;
          const first = (u?.firstname ?? '').toString().trim();
          const last = (u?.lastname ?? '').toString().trim();
          const name = `${first} ${last}`.trim() || (u?.name ?? '').toString().trim();
          return { id, name };
        })
        .filter((u: FilterUserOption) => u.id != null && !!u.name);

      const defaultUser = this.usuariosFiltro.find(u => String(u.id) === String(this.created_by));
      if (defaultUser) {
        this.selectedUsuario = defaultUser.id;
        await this.onUsuarioFilterChange();
      }
    } catch (err) {
      console.error('Error cargando usuarios de Follow up:', err);
      this.usuariosFiltro = [];
    }
  }

  async onUsuarioFilterChange(): Promise<void> {
    if (this.selectedUsuario == null || this.selectedUsuario === '') return;
    await this.loadStartWeekByCompany();
    this.loadPriorityWeekByCompany();
  }

  async loadEntitiesForGroupView(): Promise<void> {
    try {
      const resp = await this.followupService.getEntitiesByCompany(this.id_company);
      const rows = Array.isArray(resp?.data) ? resp.data : [];
      this.groupEntidades = rows
        .map((r: any) => ({
          id: r?.id_entity ?? r?.entity_id ?? r?.id,
          name: (r?.name_entity ?? r?.entity_name ?? r?.name ?? '').toString().trim(),
        }))
        .filter((x: FilterEntityOption) => x.id != null && !!x.name);

      const defaultEntity = this.groupEntidades.find(e => String(e.id) === String(this.id_entity));
      if (defaultEntity) {
        this.selectedGroupEntidad = defaultEntity.id;
      }

      await this.onGroupEntidadChange();
    } catch (err) {
      console.error('Error cargando entidades grupales de Follow up:', err);
      this.groupEntidades = [];
      this.groupEquipos = [];
    }
  }

  async onGroupEntidadChange(): Promise<void> {
    this.selectedGroupEquipo = null;
    this.groupEquipos = [];

    if (this.selectedGroupEntidad == null || this.selectedGroupEntidad === '') return;

    try {
      const resp = await this.followupService.getTeamMembersByEntity(
        this.created_by,
        this.selectedGroupEntidad,
        this.id_company
      );
      const rows = Array.isArray(resp?.data) ? resp.data : [];
      this.groupEquipos = rows
        .map((r: any) => (typeof r === 'string' ? r : r?.team ?? r?.team_name ?? r?.name ?? ''))
        .map((x: any) => x.toString().trim())
        .filter(Boolean);

      const defaultTeam = this.groupEquipos.find(team => team === this.team);
      if (defaultTeam) {
        this.selectedGroupEquipo = defaultTeam;
      }

      await this.onGroupEquipoChange();
    } catch (err) {
      console.error('Error cargando equipos grupales de Follow up:', err);
      this.groupEquipos = [];
    }
  }

  async onGroupEquipoChange(): Promise<void> {
    if (!this.selectedGroupEquipo) return;
    await this.loadPriorityWeeksFiltered();
  }

  private async loadStartWeekByCompany(): Promise<void> {
    try {
      // 1) Llamada al endpoint
      const resp = await this.followupService.getStartWeekById(this.id_company, this.currentEntityId, this.currentTeam);

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
        this.currentWeekIndex = this.getClosestWeekIndexFromStartDate();
      } else {
        // Sin fecha → limpiamos semanas
        this.qualitativeWeeks = [];
        this.quantitativeWeeks = [];
        this.currentWeekIndex = 0;
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
      id_company: Number(this.id_company),
      id_entity: Number(this.currentEntityId),
      status: 1,
      created_by: Number(this.created_by),
      team: this.currentTeam,
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
      const resp = await this.followupService.getPriorityWeekById(this.id_company, this.currentUserId);

      const raw = resp?.data;
      const data = Array.isArray(raw) ? raw[0] : raw;
      if (!data) {
        this.individualPriorityWeekRaw = null;
        this.existingPriorityWeekId = null;
        this.kpisEditable = [{ description: '', sv: '', v: '', r: '' }];
        this.priorities = [{
          name: '',
          when: '',
          isIndividual: true,
          quien: 'Usuario Actual',
          id_user: this.currentUserId,
          source: 'quarter'
        }];
        this.form.patchValue({
          criticalNumberKpis: '',
          superVerdeKpis: '',
          verdeKpis: '',
          amarilloKpis: '',
          rojoKpis: '',
          resultadoKpis: '',
          colorKpis: '',
          criticalNumberPriorities: '',
          superVerdePriorities: '',
          verdePriorities: '',
          amarilloPriorities: '',
          rojoPriorities: '',
          resultadoPrioridades: '',
          colorPrioridades: '',
        });
        this.qualitativeWeeks = [];
        this.quantitativeWeeks = [];
        if (this.startDate) {
          this.generateWeeks(0);
        }
        this.currentPriorityIndex = 0;
        return;
      }

      this.individualPriorityWeekRaw = data;

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

      // ---------- Prioridades (trimestrales + vision) ----------
      const quarterPriorities = Array.isArray(data.quarter_priority_list)
        ? data.quarter_priority_list.map((p: any) => ({
          name: p.name ?? '',
          when: p.when ?? '',
          isIndividual: !!p.isIndividual,
          quien: p.quien ?? '',
          id_user: p.id_user ?? this.currentUserId,
          source: 'quarter',
          viewType: Number(p.id_view_list) === 2 ? 2 : this.viewToId(this.vistaModo),
        }))
        : [];

      const visionPriorities = Array.isArray(data.vision_priorities)
        ? data.vision_priorities.map((p: any) => ({
          name: p.name ?? '',
          when: p.plazo ?? p.when ?? '',
          isIndividual: false,
          quien: p.provenienteDe ?? 'vision',
          source: 'vision',
          viewType: this.viewToId(this.vistaModo),
        }))
        : [];

      this.priorities = [...quarterPriorities, ...visionPriorities];

      if (!this.priorities.length) {
        // Al menos una fila editable si no hay nada
        this.priorities.push({
          name: '',
          when: '',
          isIndividual: true,
          quien: 'Usuario Actual',
          id_user: this.currentUserId,
          source: 'quarter',
          viewType: this.viewToId(this.vistaModo),
        });
      }

      // ---------- Ganar el juego (KPIs) ----------
      this.form.patchValue({
        criticalNumberKpis: data.game_critical_number_kpi ?? '',
        superVerdeKpis: data.game_green_kpi ?? '',
        verdeKpis: data.game_lemon_kpi ?? '',
        amarilloKpis: data.game_yellow_kpi ?? '',
        rojoKpis: data.game_red_kpi ?? '',
        resultadoKpis: data.game_result_kpi ?? '',
        colorKpis: this.mapTagToHex(data.game_color_kpi ?? ''),
      });

      // ---------- Ganar el juego (Prioridades) ----------
      this.form.patchValue({
        criticalNumberPriorities: data.game_critical_number_priority ?? '',
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

      const unifiedFromBe = Array.isArray(data.priority_list_view) ? data.priority_list_view : [];
      const qualFromBe = Array.isArray(data.priority_list_quality) ? data.priority_list_quality : [];
      const quantFromBe = Array.isArray(data.priority_list_quantity) ? data.priority_list_quantity : [];

      // mapear por prioridad
      this.priorities.forEach((prio, idx) => {
        const unified = unifiedFromBe.find((x: any) => (x.priority || x.name) === prio.name);
        const unifiedViewId = Number(unified?.id_view_list ?? unified?.viewType ?? unified?.idViewList ?? 0);
        if (unifiedViewId === 1 || unifiedViewId === 2) {
          prio.viewType = unifiedViewId;
        }

        // Cualitativa
        const q = unifiedViewId === 2
          ? unified
          : qualFromBe.find((x: any) => (x.priority || x.name) === prio.name);
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
          this.qualitativeWeeks[idx] = this.buildQualitativeWeeks();
        } else {
          this.qualitativeWeeks[idx] = [];
        }
        // Cuantitativa
        const Q = unifiedViewId === 1
          ? unified
          : quantFromBe.find((x: any) => (x.priority || x.name) === prio.name);
        if (Q?.weeks?.length) {
          this.quantitativeWeeks[idx] = Q.weeks.map((w: any, i: number) => ({
            week: w.week ?? i + 1,
            date: w.date ? new Date(w.date) : undefined,
            expectedResult: w.expectedResult ?? '',
            achieved: !!w.achieved,
            notAchieved: !!w.notAchieved,
          }));
        } else if (this.startDate) {
          this.quantitativeWeeks[idx] = this.buildQuantitativeWeeks();
        } else {
          this.quantitativeWeeks[idx] = [];
        }
      });

      this.currentPriorityIndex = 0;
    } catch (err) {
      console.error('Error cargando PriorityWeek:', err);
      this.individualPriorityWeekRaw = null;
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
      quien: 'Usuario Actual', // Puedes reemplazar esto con el nombre del usuario autenticado
      id_user: this.currentUserId,
      source: 'quarter',
      viewType: this.viewToId(this.vistaModo) as PriorityViewId,
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

  get currentPriorityViewId(): PriorityViewId {
    return Number(this.currentPriority?.viewType) === 2 ? 2 : 1;
  }

  get currentQualitativeWeeks() {
    return this.qualitativeWeeks[this.currentPriorityIndex] ?? [];
  }

  get currentQuantitativeWeeks() {
    return this.quantitativeWeeks[this.currentPriorityIndex] ?? [];
  }

  private buildQualitativeWeeks() {
    if (!this.startDate) return [];

    const [year, month, day] = this.startDate.split('-').map(Number);
    const base = new Date(year, month - 1, day);

    return Array.from({ length: 13 }, (_, i) => {
      const date = new Date(base);
      date.setDate(base.getDate() + i * 7);
      date.setHours(12, 0, 0, 0);

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
  }

  private buildQuantitativeWeeks() {
    if (!this.startDate) return [];

    const [year, month, day] = this.startDate.split('-').map(Number);
    const base = new Date(year, month - 1, day);

    return Array.from({ length: 13 }, (_, i) => {
      const date = new Date(base);
      date.setDate(base.getDate() + i * 7);
      date.setHours(12, 0, 0, 0);

      return {
        week: i + 1,
        date,
        expectedResult: '',
        achieved: false,
        notAchieved: false
      };
    });
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

  getColorSelectStyle(color: string | null | undefined): { [key: string]: string } {
    switch ((color || '').toUpperCase()) {
      case '#006600':
        return { backgroundColor: '#006600', color: '#ffffff', borderColor: '#006600' };
      case '#66CC66':
        return { backgroundColor: '#66CC66', color: '#0f172a', borderColor: '#66CC66' };
      case '#FFCC00':
        return { backgroundColor: '#FFCC00', color: '#0f172a', borderColor: '#FFCC00' };
      case '#CC0000':
        return { backgroundColor: '#CC0000', color: '#ffffff', borderColor: '#CC0000' };
      default:
        return { backgroundColor: '#ffffff', color: '#334155', borderColor: '#d1d5db' };
    }
  }

  async save(): Promise<void> {
    this.ensureWeeksForAll();

    // 1) Construir vistas unificadas por prioridad
    const priority_list_view = this.priorities.map((priority, idx) => {
      const viewId = Number(priority?.viewType) === 2 ? 2 : 1;

      return {
        id_view_list: viewId,
        priority: priority?.name ?? '',
        weeks: viewId === 2
          ? (this.qualitativeWeeks[idx] ?? []).map(w => ({
              week: w.week,
              date: w.date,
              expectedResult: w.expectedResult,
              superGreen: w.superGreen,
              green: w.green,
              red: w.red,
              result: w.result,
              colorName: this.getNombreColor(w.color),
            }))
          : (this.quantitativeWeeks[idx] ?? []).map(w => ({
              week: w.week,
              date: w.date,
              expectedResult: w.expectedResult,
              achieved: !!w.achieved,
              notAchieved: !!w.notAchieved,
            })),
      };
    });

    // 2) KPI list
    const kpi_list = this.kpisEditable.map(k => ({
      description: k.description ?? '',
      sv: k.sv ?? '',
      v: k.v ?? '',
      r: k.r ?? '',
    }));

    // 3) Prioridades trimestrales
    const quarter_priority_list = this.priorities
      .filter(p => p?.source !== 'vision')
      .map(p => ({
      name: p.name ?? '',
      when: p.when ?? '',
      isIndividual: !!p.isIndividual,
      quien: p.quien ?? '',
      id_user: p.id_user ?? this.currentUserId,
      id_view_list: Number(p?.viewType) === 2 ? 2 : 1,
      }));

    // 4) Ganar el juego - KPIs
    const game_green_kpi = this.form.value.superVerdeKpis ?? '';
    const game_lemon_kpi = this.form.value.verdeKpis ?? '';
    const game_yellow_kpi = this.form.value.amarilloKpis ?? '';
    const game_red_kpi = this.form.value.rojoKpis ?? '';
    const game_result_kpi = this.form.value.resultadoKpis ?? '';
    const game_color_kpi = this.mapHexToTag(this.form.value.colorKpis);
    const game_critical_number_kpi = this.form.value.criticalNumberKpis ?? '';

    // 5) Ganar el juego - Prioridades
    const game_green_priority = this.form.value.superVerdePriorities ?? '';
    const game_lemon_priority = this.form.value.verdePriorities ?? '';
    const game_yellow_priority = this.form.value.amarilloPriorities ?? '';
    const game_red_priority = this.form.value.rojoPriorities ?? '';
    const game_result_priority = this.form.value.resultadoPrioridades ?? '';
    const game_color_priority = this.mapHexToTag(this.form.value.colorPrioridades);
    const game_critical_number_priority = this.form.value.criticalNumberPriorities ?? '';

    // 6) Payloads
    const createPayload = {
      priority_list_view,
      kpi_list,
      quarter_priority_list,
      game_critical_number_kpi,
      game_green_kpi,
      game_lemon_kpi,
      game_yellow_kpi,
      game_red_kpi,
      game_result_kpi,
      game_color_kpi,
      game_critical_number_priority,
      game_green_priority,
      game_lemon_priority,
      game_yellow_priority,
      game_red_priority,
      game_result_priority,
      game_color_priority,
      id_company: this.id_company,
      id_entity: this.currentEntityId,
      team: this.currentTeam,
      status: 1,
      created_by: this.currentUserId,
    };

    const updatePayload = {
      priority_list_view,
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
      team: this.currentTeam,
      status: 1,
      created_by: this.currentUserId,
    };

    Swal.fire({
      title: this.existingPriorityWeekId ? 'Actualizando...' : 'Guardando...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    try {
      if (this.existingPriorityWeekId != null) {
        console.log("UPDATE ", updatePayload);
        await this.followupService.updatePriorityWeek(this.existingPriorityWeekId, updatePayload);
        Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'Seguimiento guardado correctamente.', confirmButtonColor: '#003660' });
      } else {
        console.log("CREATE ", createPayload);
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
  currentWeekIndex = 0;
  // filterType = 'team';
  groupPrioritiesDataQualt = [];
  groupPrioritiesDataQuant = [];
  groupCompanionsDataQualt = [];
  groupCompanionsDataQuant = [];
  groupPrioritiesData: any[] = [];
  groupCompanionsData: any[] = [];
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
    // La fecha configurada representa el FIN de la semana 1.
    // Para rango semanal (laboral), semana = lunes a viernes.
    const endWeek1 = this.parseDateAsLocal(this.startDate);
    const startWeek1 = new Date(endWeek1);
    startWeek1.setDate(endWeek1.getDate() - 4);

    const start = new Date(startWeek1);
    start.setDate(startWeek1.getDate() + this.currentWeekIndex * 7);
    return start;
  }

  getEndWeekDate(date: Date): Date {
    // Fin de semana laboral (viernes): +4 dias desde lunes.
    return new Date(date.getTime() + 4 * 24 * 60 * 60 * 1000);
  }

  getWeekRange(index: number): string {
    const start = this.getWeekStartDate();
    const end = this.getEndWeekDate(start);
    return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })}`;
  }

  private getClosestWeekIndexFromStartDate(): number {
    if (!this.startDate) return 0;

    // La fecha configurada es el fin de la semana 1 (viernes).
    const endWeek1 = this.parseDateAsLocal(this.startDate);
    const startWeek1 = new Date(endWeek1);
    startWeek1.setDate(endWeek1.getDate() - 4);

    // Hora de reunión semanal para aplicar el desfase de 4 horas
    const [meetingHour, meetingMinute] = (this.weeklyMeetingTime || '09:00')
      .split(':')
      .map(Number);

    const now = new Date();
    let currentIndex = 12;

    for (let i = 0; i < 13; i++) {
      const start = new Date(startWeek1);
      start.setDate(startWeek1.getDate() + i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 4);
      end.setHours(meetingHour || 9, meetingMinute || 0, 0, 0);

      // Regla: la siguiente semana aparece 4 horas después de iniciar reunión.
      const endWithGrace = new Date(end.getTime() + 4 * 60 * 60 * 1000);

      if (now <= endWithGrace) {
        currentIndex = i;
        break;
      }
    }

    return Math.max(0, Math.min(12, currentIndex));
  }

  private parseDateAsLocal(dateStr: string): Date {
    const [year, month, day] = (dateStr || '').split('-').map(Number);
    return new Date(year || 1970, (month || 1) - 1, day || 1, 0, 0, 0, 0);
  }

  private async loadPriorityWeeksFiltered(): Promise<void> {
    const week = this.currentWeekIndex + 1;
    try {
      const resp = this.isLevelUserTwo
        ? await this.followupService.getPriorityWeeksFilteredAdmin(
            this.id_company,
            this.currentGroupEntityId,
            this.currentGroupTeam,
            week
          )
        : await this.followupService.getPriorityWeeksFiltered(
            this.id_company,
            this.id_entity,
            this.team,
            week,
            this.created_by
          );
      this.groupFilteredResponse = resp;
      const rows = Array.isArray(resp?.data) ? resp.data : [];
      const companions = this.isLevelUserTwo ? [] : (Array.isArray(resp?.companions) ? resp.companions : []);

      this.groupPrioritiesData = this.mapGroupRows(rows, week);
      this.groupCompanionsData = this.mapGroupRows(companions, week);
      this.groupPrioritiesDataQualt = this.groupPrioritiesData;
      this.groupPrioritiesDataQuant = this.groupPrioritiesData;
      this.groupCompanionsDataQualt = this.groupCompanionsData;
      this.groupCompanionsDataQuant = this.groupCompanionsData;

      if (this.groupPrioritiesData.length) {
        this.activeGroupTab = 'leaders';
      } else if (this.groupCompanionsData.length) {
        this.activeGroupTab = 'companions';
      }

      console.log('PriorityWeeksFiltered (grupal):', resp);
    } catch (err) {
      console.error('Error cargando PriorityWeeksFiltered:', err);
      this.groupFilteredResponse = null;
      this.groupPrioritiesData = [];
      this.groupCompanionsData = [];
      this.groupPrioritiesDataQualt = [];
      this.groupPrioritiesDataQuant = [];
      this.groupCompanionsDataQualt = [];
      this.groupCompanionsDataQuant = [];
    }
  }

  get hasLeaderGroupTab(): boolean {
    return this.groupPrioritiesData.length > 0;
  }

  get hasCompanionsTab(): boolean {
    if (this.isLevelUserTwo) return false;
    return this.groupCompanionsData.length > 0;
  }

  setActiveGroupTab(tab: 'leaders' | 'companions'): void {
    this.activeGroupTab = tab;
  }

  private mapGroupRows(rows: any[], week: number): any[] {
    return rows.map((row: any, idx: number) => ({
      user: this.resolveGroupUser(row, idx),
      game: {
        criticalNumber: row?.game_critical_number_priority ?? '',
        sv: row?.game_green_priority ?? '',
        v: row?.game_lemon_priority ?? '',
        r: row?.game_red_priority ?? '',
        result: row?.game_result_priority ?? '',
        color: this.mapTagToHex(row?.game_color_priority ?? ''),
      },
      priorities: (Array.isArray(row?.priority_list_view) ? row.priority_list_view : [])
        .flatMap((p: any) =>
          (Array.isArray(p?.weeks) ? p.weeks : []).map((w: any) => ({
            name: p?.priority ?? '',
            viewType: Number(p?.id_view_list) === 2 ? 2 : 1,
            week: Number(w?.week ?? week),
            expectedResult: w?.expectedResult ?? '',
            superGreen: w?.superGreen ?? '',
            green: w?.green ?? '',
            red: w?.red ?? '',
            result: w?.result ?? '',
            color: this.mapTagToHex2(w?.colorName ?? ''),
            achieved: !!w?.achieved,
            notAchieved: w?.notAchieved != null ? !!w.notAchieved : !w?.achieved,
          }))
        ),
    }));
  }

  private resolveGroupUser(row: any, idx: number): string {
    if (row?.created_by_name) return String(row.created_by_name);
    if (row?.created_by_user) return String(row.created_by_user);
    if (row?.created_by != null) return `Usuario ${row.created_by}`;
    return `Usuario ${idx + 1}`;
  }

  previousWeek() {
    if (this.currentWeekIndex > 0) {
      this.currentWeekIndex--;
      if (this.vistaAlcance === 'grupal') {
        this.loadPriorityWeeksFiltered();
      }
    }
  }

  nextWeek() {
    if (this.currentWeekIndex < 12) {
      this.currentWeekIndex++;
      if (this.vistaAlcance === 'grupal') {
        this.loadPriorityWeeksFiltered();
      }
    }
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

  exportIndividualPdf(): void {
    this.ensureWeeksForAll();
    void exportElementToPdf(this.individualPdfExportContent?.nativeElement, 'followup_individual');
  }

  exportIndividualExcel(): void {
    const summaryRows = [
      {
        Entidad: this.selectedEntityName,
        Equipo: this.selectedEquipo || this.team,
        Colaborador: this.selectedUserName,
        'Fecha base semana 1': this.startDate || '',
        'Tipo de seguimiento': this.reportModeLabel,
        'Cantidad de KPIs': this.kpisEditable.length,
        'Cantidad de prioridades': this.priorities.length,
        'Horizonte por prioridad': 13,
      }
    ];

    const kpiRows = this.kpisEditable.map((kpi, index) => ({
      '#': index + 1,
      Descripcion: kpi.description || '',
      SV: kpi.sv || '',
      V: kpi.v || '',
      R: kpi.r || '',
    }));

    const priorityRows = this.priorities.map((priority, index) => ({
      '#': index + 1,
      Prioridad: priority?.name || '',
      'Fecha compromiso': priority?.when || '',
      Clasificacion: this.getPriorityTypeLabel(priority),
    }));

    const gameKpiRows = [
      {
        'Numero critico': this.form.get('criticalNumberKpis')?.value || '',
        SV: this.form.get('superVerdeKpis')?.value || '',
        V: this.form.get('verdeKpis')?.value || '',
        A: this.form.get('amarilloKpis')?.value || '',
        R: this.form.get('rojoKpis')?.value || '',
        Resultado: this.form.get('resultadoKpis')?.value || '',
      }
    ];

    const gamePriorityRows = [
      {
        'Numero critico': this.form.get('criticalNumberPriorities')?.value || '',
        SV: this.form.get('superVerdePriorities')?.value || '',
        V: this.form.get('verdePriorities')?.value || '',
        A: this.form.get('amarilloPriorities')?.value || '',
        R: this.form.get('rojoPriorities')?.value || '',
        Resultado: this.form.get('resultadoPrioridades')?.value || '',
      }
    ];

    const weeklyRows = this.individualPdfWeekRows.map((row) => ({
      Usuario: row.user,
      Prioridad: row.priority,
      Semana: row.week,
      Fecha: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : (row.date || ''),
      'Entregable o resultado esperado': row.expectedResult,
      ...(this.vistaModo === 'cualitativa'
        ? {
            SV: row.superGreen || '',
            V: row.green || '',
            R: row.red || '',
            Resultado: row.result || '',
            Color: row.color || '',
          }
        : {
            Logrado: row.achieved ? 'Si' : '',
            'No logrado': row.notAchieved ? 'Si' : '',
          }),
    }));

    void exportSheetsToExcel('followup_individual', [
      { name: 'Resumen', rows: summaryRows },
      { name: 'KPIs', rows: kpiRows },
      { name: 'Prioridades', rows: priorityRows },
      { name: 'Ganar Juego KPIs', rows: gameKpiRows },
      { name: 'Ganar Juego Priorid', rows: gamePriorityRows },
      { name: 'Detalle semanal', rows: weeklyRows },
    ]);
  }

  exportGroupPdf(): void {
    void exportElementToPdf(this.groupPdfExportContent?.nativeElement, 'followup_grupal');
  }

  exportGroupExcel(): void {
    const summaryRows = [
      {
        Entidad: this.isLevelUserTwo ? this.selectedGroupEntityName : this.id_entity,
        Equipo: this.isLevelUserTwo ? this.currentGroupTeam : this.team,
        Alcance: this.activeGroupDatasetLabel,
        Semana: this.currentWeekIndex + 1,
        Rango: this.getWeekRange(this.currentWeekIndex),
        'Tipo de seguimiento': 'Seguimiento mixto por prioridad',
        Usuarios: this.activeGroupUsersForView.length,
        Registros: this.groupPdfWeekRows.length,
      }
    ];

    const gameRows = this.activeGroupUsersForView.map((user: any) => ({
      Usuario: user?.user || '',
      'Numero critico': user?.game?.criticalNumber || '',
      SV: user?.game?.sv || '',
      V: user?.game?.v || '',
      R: user?.game?.r || '',
      Resultado: user?.game?.result || '',
      Color: this.getNombreColor(user?.game?.color || ''),
    }));

    const weeklyRows = this.groupPdfWeekRows.map((row) => ({
      Usuario: row.user,
      Prioridad: row.priority,
      Vista: (row as any).viewType === 2 ? 'Cualitativa' : 'Cuantitativa',
      Semana: row.week,
      'Entregable o resultado esperado': row.expectedResult,
      SV: row.superGreen || '',
      V: row.green || '',
      R: row.red || '',
      Resultado: row.result || '',
      Color: row.color || '',
      Logrado: row.achieved ? 'Si' : '',
      'No logrado': row.notAchieved ? 'Si' : '',
    }));

    void exportSheetsToExcel('followup_grupal', [
      { name: 'Resumen', rows: summaryRows },
      { name: 'Ganar Juego', rows: gameRows },
      { name: 'Detalle semanal', rows: weeklyRows },
    ]);
  }
}





