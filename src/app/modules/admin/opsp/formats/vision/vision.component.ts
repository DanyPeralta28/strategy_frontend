import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service'
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';
import { OpspEntityContextService } from 'app/modules/admin/services/opsp-entity-context.service';
import { OpspEntityFilterComponent } from '../../components/opsp-entity-filter/opsp-entity-filter.component';

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
  selector: 'app-vision',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective, OpspEntityFilterComponent],
  templateUrl: './vision.component.html',
  styleUrl: './vision.component.scss'
})
export class VisionComponent {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  @ViewChildren('autosizeArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;
  visionForm!: FormGroup;

  existingVisionId: number | null = null;
  existingBhagId: number | null = null;
  originalBhagDescription: string = '';
  existingPurposeId: number | null = null;
  originalPurposeDescription: string = '';
  user_name: string = 'jdoe';
  created_by = getSessionUserId();
  status = 1;
  private coreValuesBackup = '';
  isEditingGameTitle1 = false;
  isEditingGameTitle2 = false;

  id_company = getSessionCompanyId();
  id_entity = getSessionEntityId();
  bhag: any;

  estados = [
    { color: '#006600', placeholder: 'Excelente (verde oscuro)', key: 'green' },
    { color: '#66CC66', placeholder: 'Bien (verde claro)', key: 'lemon' },
    { color: '#FFCC00', placeholder: 'Entre verde y rojo', key: 'yellow' },
    { color: '#CC0000', placeholder: 'En problemas (rojo)', key: 'red' }
  ];

  usuarios: Array<{ id: string | number; nombre: string }> = [];

  constructor(
    public opspService: OpspService,
    private fb: FormBuilder,
    private opspEntityContextService: OpspEntityContextService
  ) { }

  get currentEntityId(): number | string {
    return this.opspEntityContextService.getCurrentEntityId();
  }

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_vision');
  }

  async exportExcel(): Promise<void> {
    void Swal.fire({
      title: 'Generando Excel',
      text: 'Preparando descarga...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      const fileName = `opsp_vision_${this.getExcelTimestamp()}.xlsx`;

      const fundamentos = [
        { Seccion: 'Fundamentos', Campo: 'Valores Centrales', Valor: this.getStringValue('valores') },
        { Seccion: 'Fundamentos', Campo: 'Proposito', Valor: this.getStringValue('proposito') },
        { Seccion: 'Fundamentos', Campo: 'Promesas de Marca', Valor: this.getStringValue('promesas') },
        { Seccion: 'Fundamentos', Campo: 'BHAG', Valor: this.getStringValue('bhag') },
        { Seccion: 'Ganar el Juego', Campo: 'Titulo 1', Valor: this.resolveGameTitle('game_title_1', 'Ganar el Juego Anual') },
        { Seccion: 'Ganar el Juego', Campo: 'Titulo 2', Valor: this.resolveGameTitle('game_title_2', 'Ganar el Juego Trimestre') },
      ];

      this.appendSheet(XLSX, workbook, 'Fundamentos', fundamentos, [22, 28, 80]);

      const prioridadesEstrategicas = [
        ...this.strategic3to5.controls.map((group, index) => ({
          Horizonte: '3-5 años',
          Numero: index + 1,
          Prioridad: (group.get('value')?.value || '').toString().trim(),
        })),
        ...this.strategic1Year.controls.map((group, index) => ({
          Horizonte: '1 año',
          Numero: index + 1,
          Prioridad: (group.get('value')?.value || '').toString().trim(),
          Quien: (group.get('titulo')?.value || '').toString().trim(),
        })),
      ];

      this.appendSheet(XLSX, workbook, 'Prioridades Estratégicas', prioridadesEstrategicas, [16, 10, 70, 28]);

      const prioridadesTrimestrales = this.priority_list.controls.map((group, index) => {
        const subprioridades = this.getSubprioridades(index).controls
          .map((control) => (control.value || '').toString().trim())
          .filter(Boolean)
          .join(' | ');

        return {
          Numero: index + 1,
          Prioridad: (group.get('prioridad')?.value || '').toString().trim(),
          Plazo: (group.get('plazo')?.value || '').toString().trim(),
          Quien: this.getPriorityResponsibleName(group),
          EsIndividual: group.get('esIndividual')?.value ? 'Si' : 'No',
          EsOKR: group.get('esOKR')?.value ? 'Si' : 'No',
          Subprioridades: subprioridades,
        };
      });

      this.appendSheet(XLSX, workbook, 'Prioridades Trimestrales', prioridadesTrimestrales, [10, 44, 16, 28, 16, 12, 70]);

      const kpis = this.kpis.controls.map((group, index) => ({
        Numero: index + 1,
        KPI: (group.get('kpi')?.value || '').toString().trim(),
        Meta: (group.get('meta')?.value || '').toString().trim(),
      }));

      this.appendSheet(XLSX, workbook, 'KPIs', kpis, [10, 52, 24]);

      const juego1 = this.ganarJuego1.controls.map((group, index) => ({
        Color: this.getEstadoNombre(index),
        Descripcion: (group.get('descripcion')?.value || '').toString().trim(),
      }));

      const juego2 = this.ganarJuego2.controls.map((group, index) => ({
        Color: this.getEstadoNombre(index),
        Descripcion: (group.get('descripcion')?.value || '').toString().trim(),
      }));

      this.appendSheet(XLSX, workbook, this.resolveGameTitle('game_title_1', 'Ganar el Juego Anual'), juego1, [18, 80]);
      this.appendSheet(XLSX, workbook, this.resolveGameTitle('game_title_2', 'Ganar el Juego Trimestre'), juego2, [18, 80]);

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error al exportar Excel de Vision:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el Excel.',
        confirmButtonColor: '#003660'
      });
    } finally {
      Swal.close();
    }
  }


  ngOnInit(): void {
    this.visionForm = this.fb.group({
      valores: [''],
      proposito: [''],
      promesas: [''],
      bhag: [''],
      game_title_1: ['Ganar el Juego Anual'],
      game_title_2: ['Ganar el Juego Trimestre'],
      strategic_priorities_3_to_5_years: this.fb.array([]),
      strategic_priorities_1_year: this.fb.array([]),
      priority_list: this.fb.array([]),
      // prioridadesCorto: this.fb.array([]),
      kpis: this.fb.array([]),
      ganarJuego1: this.fb.array(this.createGanarJuegoRows()),
      ganarJuego2: this.fb.array(this.createGanarJuegoRows()),
    });

    this.loadBhag();
    this.loadPurpose();
    this.loadCollaborators();
    this.opspEntityContextService.entityChanges$.subscribe(() => {
      this.loadBhag();
      this.loadPurpose();
      this.loadCollaborators();
    });
  }

  private loadCollaborators(): void {
    this.opspService
      .getTeamViewerCollaborators(this.id_company, this.currentEntityId)
      .then((resp: any) => {
        const rows = Array.isArray(resp?.data) ? resp.data : [];
        this.usuarios = rows
          .map((u: any) => {
            const id = u?.id_user ?? u?.user_id ?? u?.id ?? u?.collaborator_id;
            const first = (u?.firstname ?? '').toString().trim();
            const last = (u?.lastname ?? '').toString().trim();
            const fullName = `${first} ${last}`.trim();
            const nombre = (
              fullName ||
              u?.name ||
              u?.full_name ||
              u?.user_name ||
              u?.username ||
              u?.collaborator_name ||
              ''
            ).toString().trim();
            return { id, nombre };
          })
          .filter((u: any) => u.id != null && !!u.nombre);
      })
      .catch((err: any) => {
        console.error('Error cargando colaboradores para Vision:', err);
        this.usuarios = [];
      });
  }
  loadBhag() {
    this.opspService
      .getBhagByCompany(this.id_company)
      .then(bhag => {
        if (!bhag?.data || bhag.data.length === 0) {
          this.existingBhagId = null;
          this.originalBhagDescription = '';
          this.bhag = '';
          this.visionForm.patchValue({ bhag: '' });
          this.loadVisionData();
          // no existe todavía
          return;
        }
        const b = bhag.data[0];
        this.existingBhagId = b.id;
        this.originalBhagDescription = b.description || '';
        this.bhag = this.originalBhagDescription;
        this.visionForm.patchValue({
          bhag: this.originalBhagDescription
        });
        this.loadVisionData();
      })
      .catch(err => {
        console.error("Error cargando BHAG:", err);
        // aun así puedes cargar la visión aunque no haya BHAG
        this.loadVisionData();
      });
  }

  private saveBhagIfNeeded(): Promise<any> {
    const currentBhag = (this.visionForm.get('bhag')?.value || '').trim();

    if (!currentBhag) {
      // nada que hacer si está vacío
      return Promise.resolve(null);
    }

    // Si ya existe y no cambió, no hacemos nada
    if (this.existingBhagId && currentBhag === this.originalBhagDescription) {
      return Promise.resolve(null);
    }

    if (this.existingBhagId) {
      // update
      return this.opspService
        .updateBhag(this.existingBhagId, { description: currentBhag, created_by: this.created_by })
        .then(res => {
          this.originalBhagDescription = currentBhag;
          this.bhag = currentBhag;
          return res;
        });
    } else {
      // create
      const obj = {
        id_company: this.id_company,
        description: currentBhag,
        created_by: this.created_by
      };
      return this.opspService.createBhag(obj).then(res => {
        if (res?.data && res.data[0]?.id) {
          this.existingBhagId = res.data[0].id;
        }
        this.originalBhagDescription = currentBhag;
        this.bhag = currentBhag;
        return res;
      });
    }
  }

  loadPurpose(): void {
    this.opspService
      .getPurposeByCompany(this.id_company)
      .then(purposeResp => {
        if (!purposeResp?.data || purposeResp.data.length === 0) {
          this.existingPurposeId = null;
          this.originalPurposeDescription = '';
          this.visionForm.patchValue({ proposito: '' });
          return; // no hay propósito aún
        }
        const p = purposeResp.data[0];
        if (p.id) {
          this.existingPurposeId = p.id;
        }
        // guardamos la descripción original para detectar cambios
        this.originalPurposeDescription = p.purpose_description || '';
        this.visionForm.patchValue({
          proposito: this.originalPurposeDescription
        });
      })
      .catch(err => {
        console.error('Error cargando Propósito:', err);
      });
  }

  private savePurposeIfNeeded(): Promise<any> {
    const currentPurpose = (this.visionForm.get('proposito')?.value || '').trim();

    if (!currentPurpose) {
      return Promise.resolve(null); // nada que guardar
    }

    // si ya existe y no cambió, no hacemos nada
    if (this.existingPurposeId && currentPurpose === this.originalPurposeDescription) {
      return Promise.resolve(null);
    }

    const payload: any = {
      purpose_description: currentPurpose,
      created_by: this.created_by
    };

    if (!this.existingPurposeId) {
      // creación requiere company
      payload.id_company = this.id_company;
      return this.opspService.createPurpose(payload).then(res => {
        if (res?.data && res.data[0]?.id) {
          this.existingPurposeId = res.data[0].id;
        }
        this.originalPurposeDescription = currentPurpose;
        return res;
      });
    } else {
      // actualización: omitimos id_company si el backend lo rechaza
      return this.opspService.updatePurpose(this.existingPurposeId, payload).then(res => {
        this.originalPurposeDescription = currentPurpose;
        return res;
      });
    }
  }

  loadVisionData(): void {
    this.opspService
      .getVisionByCompany(this.id_company)
      .then(resp => {
        console.log("VISION recibido:", resp.data);
        if (!resp?.data || resp.data.length === 0) {
          this.existingVisionId = null;
          this.visionForm.patchValue({
            valores: '',
            promesas: '',
            game_title_1: 'Ganar el Juego Anual',
            game_title_2: 'Ganar el Juego Trimestre'
          });
          this.coreValuesBackup = '';
          this.strategic3to5.clear();
          this.strategic1Year.clear();
          this.priority_list.clear();
          this.kpis.clear();
          this.ganarJuego1.controls.forEach((group) => group.get('descripcion')!.setValue(''));
          this.ganarJuego2.controls.forEach((group) => group.get('descripcion')!.setValue(''));
          // no hay visión previa; puedes dejar el form en blanco y salir
          return;
        }
        const data = resp.data[0];

        // actualizar meta de existencia
        if (data.id) {
          this.existingVisionId = data.id;
        }
        if (data.created_by) {
          this.created_by = data.created_by;
        }
        if (data.user_name) {
          this.user_name = data.user_name;
        }

        this.visionForm.patchValue({
          valores: data.core_values || '',
          // proposito: data.proposito,
          promesas: data.brand_promises,
          bhag: this.bhag,
          game_title_1: data.game_title_1 || this.visionForm.get('game_title_1')?.value || 'Ganar el Juego Anual',
          game_title_2: data.game_title_2 || this.visionForm.get('game_title_2')?.value || 'Ganar el Juego Trimestre'
        });
        this.coreValuesBackup = data.core_values || this.coreValuesBackup;
        this.loadCoreValuesForVision();

        // 3-5 years
        this.strategic3to5.clear();

        (data.strategic_priorities_3_to_5_years || []).forEach(item => {
          this.strategic3to5.push(this.fb.group({
            value: [item.value || ''],
            titulo: [item.titulo || '']
          }));
        });
        // 1 year
        this.strategic1Year.clear();

        (data.strategic_priorities_1_year || []).forEach(item => {
          const whoName = item.who || item.titulo || '';

          this.strategic1Year.push(this.fb.group({
            value: [item.value || ''],
            titulo: [whoName]
          }));
        });
        // trimester
        this.priority_list.clear();

        (data.priority_list || []).forEach(item => {
          const subs = this.fb.array(
            (item.subprioridades || []).map(sp => this.fb.control(sp))
          );

          this.priority_list.push(this.fb.group({
            esOKR: [item.esOKR],
            plazo: [item.plazo || ''],
            prioridad: [item.prioridad || ''],
            quien: [item.who || ''],
            quienNombre: [item.who_name || ''],
            esIndividual: [item.esIndividual || false],
            subprioridades: subs
          }));
        });
        // KPI
        this.kpis.clear();

        (data.kpi_list || []).forEach(item => {
          this.kpis.push(this.fb.group({
            kpi: [item.kpi || ''],
            meta: [item.meta || '']
          }));
        });
        // GANAR EL JUEGO
        this.ganarJuego1.controls.forEach((group, i) => {
          const key = `game_${this.estados[i].key}_1`;
          const val = data[key] ?? '';
          group.get('descripcion')!.setValue(val);
        });
        // GANAR EL JUEGO 2
        this.ganarJuego2.controls.forEach((group, i) => {
          const key = `game_${this.estados[i].key}_2`;
          const val = data[key] ?? '';
          group.get('descripcion')!.setValue(val);
        });

        console.log('FormVision:', this.visionForm.value);
      })
      .catch(err => {
        console.error("Error cargando BHAG:", err);
      });
  }

  private async loadCoreValuesForVision(): Promise<void> {
    try {
      const resp = await this.opspService.getCoreValuesByCompany(this.id_company);
      const items = resp.data || [];
      const csv = items
        .map((v: any) => (
          v?.value_title ??
          v?.core_value ??
          v?.value ??
          v?.title ??
          v?.name ??
          ''
        ).toString().trim())
        .filter((t: string) => t)
        .join(', ');
      // Solo sobrescribe si realmente obtuvo valores para no perder lo que ya esta en Vision.
      if (csv) {
        this.visionForm.patchValue({ valores: csv });
        this.coreValuesBackup = csv;
      }
    } catch (err) {
      console.error('Error cargando valores centrales para visión:', err);
      // no fallar duro; deja lo que venga de data.core_values
    }
  }

  private resolveCoreValuesForPayload(): string {
    const fromForm = (this.visionForm.get('valores')?.value || '').toString().trim();
    if (fromForm) return fromForm;
    return (this.coreValuesBackup || '').toString().trim();
  }

  // prioridades estrategicas
  get strategic3to5(): FormArray {
    return this.visionForm.get('strategic_priorities_3_to_5_years') as FormArray;
  }

  get strategic1Year(): FormArray {
    return this.visionForm.get('strategic_priorities_1_year') as FormArray;
  }

  // get prioridadesCorto(): FormArray {
  //   return this.visionForm.get('prioridadesCorto') as FormArray;
  // }

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  ngAfterViewInit(): void {
    this.textareas.forEach(textarea => {
      this.autoResize(textarea.nativeElement);
    });
  }

  // Métodos
  addItem(arr: FormArray) {
    arr.push(this.fb.group({ value: [''], titulo: [''] }));
  }

  removeItem(arr: FormArray, i: number) {
    arr.removeAt(i);
  }

  addItemWithOwner(array: FormArray) {
    array.push(
      this.fb.group({
        descripcion: [''],
        quien: ['']
      })
    );
  }

  trackByIndex(_index: number): number {
    return _index;
  }

  createKpiRows(count: number): FormGroup[] {
    return Array.from({ length: count }, () =>
      this.fb.group({
        kpi: [''],
        meta: ['']
      })
    );
  }

  createPrioridadRows(count: number): FormGroup[] {
    return Array.from({ length: count }, () =>
      this.fb.group({
        prioridad: [''],
        plazo: ['']
      })
    );
  }

  createGanarJuegoRows(): FormGroup[] {
    return this.estados.map(() =>
      this.fb.group({
        descripcion: ['']
      })
    );
  }

  // KPIS
  get kpis(): FormArray {
    return this.visionForm.get('kpis') as FormArray;
  }

  createKpiGroup(): FormGroup {
    return this.fb.group({
      kpi: [''],
      meta: ['']
    });
  }

  addKpi(): void {
    this.kpis.push(this.createKpiGroup());
  }

  removeKpi(index: number): void {
    this.kpis.removeAt(index);
  }

  get ganarJuego1(): FormArray {
    return this.visionForm.get('ganarJuego1') as FormArray;
  }

  get ganarJuego2(): FormArray {
    return this.visionForm.get('ganarJuego2') as FormArray;
  }

  // prioridades trimestrales
  get priority_list(): FormArray {
    return this.visionForm.get('priority_list') as FormArray;
  }

  createPrioridadForm(): FormGroup {
    return this.fb.group({
      prioridad: [''],
      plazo: [''],
      esOKR: [false],
      subprioridades: this.fb.array([]),
      esIndividual: [false],
      quien: [''],
      quienNombre: [''],
    });
  }

  addPrioridad(): void {
    this.priority_list.push(this.createPrioridadForm());
  }

  removePrioridad(index: number): void {
    this.priority_list.removeAt(index);
  }

  getSubprioridades(index: number): FormArray {
    return (this.priority_list.at(index) as FormGroup).get('subprioridades') as FormArray;
  }

  addSubprioridad(index: number): void {
    this.getSubprioridades(index).push(this.fb.control(''));
  }

  removeSubprioridad(prioridadIndex: number, subIndex: number): void {
    this.getSubprioridades(prioridadIndex).removeAt(subIndex);
  }

  getPriorityResponsibleName(group: any): string {
    const quienId = group?.get?.('quien')?.value ?? group?.quien;
    const quienNombre = (group?.get?.('quienNombre')?.value ?? group?.quienNombre ?? '').toString().trim();
    const usuario = this.usuarios.find((item) => String(item.id) === String(quienId));
    return usuario?.nombre || quienNombre || (quienId ?? '').toString().trim();
  }

  // GENERAR PAYLOADS
  private extractWinGameValues(): Record<string, any> {
    const result: Record<string, any> = {};
    this.ganarJuego1.controls.forEach((group, i) => {
      const key = `game_${this.estados[i].key}_1`;
      result[key] = group.get('descripcion')?.value || '';
    });
    this.ganarJuego2.controls.forEach((group, i) => {
      const key = `game_${this.estados[i].key}_2`;
      result[key] = group.get('descripcion')?.value || '';
    });
    return result;
  }

  private buildVisionData(): Array<{ key: string; values: { titulo: string; value: string }[] }> {
    const arr: Array<{ key: string; values: { titulo: string; value: string }[] }> = [];

    if (this.strategic3to5.length) {
      arr.push({
        key: 'threeFiveYears',
        values: this.strategic3to5.value.map((v: any) => ({
          titulo: v.titulo,
          value: v.value
        }))
      });
    }

    if (this.strategic1Year.length) {
      arr.push({
        key: 'year',
        values: this.strategic1Year.value.map((v: any) => ({
          titulo: v.titulo,
          value: v.value
        }))
      });
    }

    // Si en el futuro incorporas prioridades trimestrales estilo "trimesterOne" etc.,
    // agrega aquí bloques adicionales como:
    // arr.push({ key: 'trimesterOne', values: [...] });

    return arr;
  }

  private buildPriorityList(): any[] {
    return this.priority_list.value.map((p: any) => {
      const parsedWho = Number(p.quien);
      return {
        prioridad: p.prioridad,
        plazo: p.plazo,
        esOKR: p.esOKR,
        esIndividual: p.esIndividual,
        // Enviamos solo id_user seleccionado (sin nombre)
        who: p.quien === '' || p.quien == null || !Number.isFinite(parsedWho) ? null : parsedWho,
        subprioridades: p.subprioridades || []
      };
    });
  }

  private buildKpiList(): any[] {
    return this.kpis.value.map((k: any) => ({
      kpi: k.kpi,
      meta: k.meta
    }));
  }

  private buildVisionPayload(isCreate: boolean): any {
    const form = this.visionForm.value;
    const coreValues = this.resolveCoreValuesForPayload();

    const base: any = {
      core_values: coreValues,
      brand_promises: form.promesas,
      game_title_1: this.resolveGameTitle('game_title_1', 'Ganar el Juego Anual'),
      game_title_2: this.resolveGameTitle('game_title_2', 'Ganar el Juego Trimestre'),
      user_name: this.user_name,
      kpi_list: this.buildKpiList(),
      priority_list: this.buildPriorityList(),
      ...this.extractWinGameValues(),
      status: this.status,
      created_by: this.created_by,
      visionData: this.buildVisionData(),
    };

    if (isCreate) {
      base.id_company = this.id_company; // solo para creación
    }

    return base;
  }

  resolveGameTitle(controlName: 'game_title_1' | 'game_title_2', fallback: string): string {
    const raw = this.visionForm.get(controlName)?.value;
    const text = (raw ?? '').toString().trim();
    return text || fallback;
  }

  enableGameTitleEdit(type: 1 | 2): void {
    if (type === 1) {
      this.isEditingGameTitle1 = true;
      return;
    }
    this.isEditingGameTitle2 = true;
  }

  confirmGameTitle(type: 1 | 2): void {
    if (type === 1) {
      const title = this.resolveGameTitle('game_title_1', 'Ganar el Juego Anual');
      this.visionForm.patchValue({ game_title_1: title });
      this.isEditingGameTitle1 = false;
      return;
    }
    const title = this.resolveGameTitle('game_title_2', 'Ganar el Juego Trimestre');
    this.visionForm.patchValue({ game_title_2: title });
    this.isEditingGameTitle2 = false;
  }

  private getStringValue(controlName: string): string {
    return (this.visionForm.get(controlName)?.value || '').toString().trim();
  }

  private getEstadoNombre(index: number): string {
    const key = this.estados[index]?.key;
    switch (key) {
      case 'green':
        return 'Super Verde';
      case 'lemon':
        return 'Verde';
      case 'yellow':
        return 'Amarillo';
      case 'red':
        return 'Rojo';
      default:
        return '';
    }
  }

  private appendSheet(
    XLSX: typeof import('xlsx'),
    workbook: import('xlsx').WorkBook,
    sheetName: string,
    rows: Record<string, string | number>[],
    widths: number[]
  ): void {
    if (!rows.length) {
      return;
    }

    const safeName = this.sanitizeSheetName(sheetName);
    const sheet = XLSX.utils.json_to_sheet(rows);
    (sheet as { ['!cols']?: Array<{ wch: number }> })['!cols'] = widths.map((width) => ({ wch: width }));
    XLSX.utils.book_append_sheet(workbook, sheet, this.makeUniqueSheetName(workbook, safeName));
  }

  private sanitizeSheetName(name: string): string {
    return name.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Hoja';
  }

  private makeUniqueSheetName(workbook: import('xlsx').WorkBook, baseName: string): string {
    let candidate = baseName;
    let suffix = 2;

    while (workbook.SheetNames.includes(candidate)) {
      const suffixText = ` ${suffix}`;
      candidate = `${baseName.slice(0, Math.max(1, 31 - suffixText.length))}${suffixText}`;
      suffix++;
    }

    return candidate;
  }

  private getExcelTimestamp(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  private async resolveExistingVisionId(): Promise<void> {
    if (this.existingVisionId) return;
    const resp = await this.opspService.getVisionByCompany(this.id_company);
    const data = Array.isArray(resp?.data) ? resp.data[0] : null;
    if (data?.id) {
      this.existingVisionId = data.id;
    }
  }

  private async persistVisionPayload(payload: any): Promise<any> {
    if (this.existingVisionId) {
      return this.opspService.updateVision(this.existingVisionId, payload);
    }

    try {
      const createRes = await this.opspService.createVision(payload);
      if (createRes?.data?.[0]?.id) {
        this.existingVisionId = createRes.data[0].id;
      }
      return createRes;
    } catch (error: any) {
      // Fallback: if backend rejects create because record exists, refresh id and retry as update.
      if (error?.status === 400) {
        await this.resolveExistingVisionId();
        if (this.existingVisionId) {
          return this.opspService.updateVision(this.existingVisionId, this.buildVisionPayload(false));
        }
      }
      throw error;
    }
  }

  save(): void {
    if (this.visionForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Revisa que los campos requeridos estén completos.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false
    });

    this.resolveExistingVisionId()
      .then(() => {
        const wasCreate = !this.existingVisionId;
        const visionPayload = this.buildVisionPayload(wasCreate);
        const visionPromise = this.persistVisionPayload(visionPayload);
        const bhagPromise = this.saveBhagIfNeeded();
        const purposePromise = this.savePurposeIfNeeded();

        return Promise.allSettled([visionPromise, bhagPromise, purposePromise]);
      })
      .then(results => {
        const [visionRes, bhagRes, purposeRes] = results;
        const successMsgs: string[] = [];
        const errorMsgs: string[] = [];

        if (visionRes.status === 'fulfilled') {
          successMsgs.push('Visión guardada');
        } else {
          console.error('Error guardando visión:', visionRes.reason);
          errorMsgs.push('Visión: ' + (visionRes.reason?.message || 'Error al guardar'));
        }

        if (bhagRes.status === 'fulfilled') {
          if (bhagRes.value) {
            successMsgs.push(this.existingBhagId ? 'BHAG actualizado' : 'BHAG creado');
          }
        } else {
          console.error('Error guardando BHAG:', bhagRes.reason);
          errorMsgs.push('BHAG: ' + (bhagRes.reason?.message || 'Error al guardar'));
        }

        if (purposeRes.status === 'fulfilled') {
          if (purposeRes.value) {
            successMsgs.push(this.existingPurposeId ? 'Propósito actualizado' : 'Propósito creado');
          }
        } else {
          console.error('Error guardando propósito:', purposeRes.reason);
          errorMsgs.push('Propósito: ' + (purposeRes.reason?.message || 'Error al guardar'));
        }

        const title = errorMsgs.length ? 'Resultado mixto' : '¡Guardado!';
        const textParts = [...successMsgs, ...errorMsgs].filter(Boolean).join('. ');

        Swal.fire({
          icon: errorMsgs.length ? 'warning' : 'success',
          title,
          text: textParts,
          confirmButtonColor: '#003660'
        });
      })
      .catch(err => {
        console.error('Error preparando guardado de visión:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo preparar el guardado de visión.',
          confirmButtonColor: '#003660'
        });
      });
  }
}









