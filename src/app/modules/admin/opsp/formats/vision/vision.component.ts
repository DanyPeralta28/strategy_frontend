import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service'
import { environment } from 'environments/environment';

@Component({
  selector: 'app-vision',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './vision.component.html',
  styleUrl: './vision.component.scss'
})
export class VisionComponent {
  @ViewChildren('autosizeArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;
  visionForm!: FormGroup;

  existingVisionId: number | null = null;
  existingBhagId: number | null = null;
  originalBhagDescription: string = '';
  existingPurposeId: number | null = null;
  originalPurposeDescription: string = '';
  user_name: string = 'jdoe';
  created_by: string = environment.defaultCreatedBy;
  status = 1;

  id_company: string = environment.defaultCompanyId;
  bhag: any;

  estados = [
    { color: '#006600', placeholder: 'Excelente (verde oscuro)', key: 'green' },
    { color: '#66CC66', placeholder: 'Bien (verde claro)', key: 'lemon' },
    { color: '#FFCC00', placeholder: 'Entre verde y rojo', key: 'yellow' },
    { color: '#CC0000', placeholder: 'En problemas (rojo)', key: 'red' }
  ];

  usuarios = [
    { id: '1', nombre: 'Juan Pérez' },
    { id: '2', nombre: 'María García' },
    { id: '3', nombre: 'Carlos Rodríguez' }
  ];

  constructor(public opspService: OpspService, private fb: FormBuilder) { }


  ngOnInit(): void {
    this.visionForm = this.fb.group({
      valores: [''],
      proposito: [''],
      promesas: [''],
      bhag: [''],
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
  }

  loadBhag() {
    this.opspService
      .getBhagByCompany(this.id_company)
      .then(bhag => {
        if (!bhag?.data || bhag.data.length === 0) {
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
          // valores: data.core_values,
          // proposito: data.proposito,
          promesas: data.brand_promises,
          bhag: this.bhag
        });
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
        .map((v: any) => v.value_title?.trim())
        .filter((t: string) => t)
        .join(', ');
      // Sobrescribe el campo de valores con los valores centrales formateados
      this.visionForm.patchValue({ valores: csv });
    } catch (err) {
      console.error('Error cargando valores centrales para visión:', err);
      // no fallar duro; deja lo que venga de data.core_values
    }
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
    return this.priority_list.value.map((p: any) => ({
      prioridad: p.prioridad,
      plazo: p.plazo,
      esOKR: p.esOKR,
      esIndividual: p.esIndividual,
      who: p.quien,
      subprioridades: p.subprioridades || []
    }));
  }

  private buildKpiList(): any[] {
    return this.kpis.value.map((k: any) => ({
      kpi: k.kpi,
      meta: k.meta
    }));
  }

  private buildVisionPayload(isCreate: boolean): any {
    const form = this.visionForm.value;

    const base: any = {
      core_values: form.valores,
      brand_promises: form.promesas,
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

    const isCreateVision = !this.existingVisionId;
    const visionPayload = this.buildVisionPayload(isCreateVision);

    Swal.fire({
      title: 'Guardando...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false
    });

    const visionPromise: Promise<any> = isCreateVision
      ? this.opspService.createVision(visionPayload)
      : this.opspService.updateVision(this.existingVisionId!, visionPayload);

    const bhagPromise = this.saveBhagIfNeeded();
    const purposePromise = this.savePurposeIfNeeded();

    Promise.allSettled([visionPromise, bhagPromise, purposePromise]).then(results => {
      const [visionRes, bhagRes, purposeRes] = results;
      const successMsgs: string[] = [];
      const errorMsgs: string[] = [];

      // Visión
      if (visionRes.status === 'fulfilled') {
        successMsgs.push(isCreateVision ? 'Visión creada' : 'Visión actualizada');
        if (isCreateVision && visionRes.value?.data && visionRes.value.data[0]?.id) {
          this.existingVisionId = visionRes.value.data[0].id;
        }
      } else {
        console.error('Error guardando visión:', visionRes.reason);
        errorMsgs.push('Visión: ' + (visionRes.reason?.message || 'Error al guardar'));
      }

      // BHAG
      if (bhagRes.status === 'fulfilled') {
        if (bhagRes.value) {
          successMsgs.push(this.existingBhagId ? 'BHAG actualizado' : 'BHAG creado');
        }
      } else {
        console.error('Error guardando BHAG:', bhagRes.reason);
        errorMsgs.push('BHAG: ' + (bhagRes.reason?.message || 'Error al guardar'));
      }

      // Propósito
      if (purposeRes.status === 'fulfilled') {
        if (purposeRes.value) {
          successMsgs.push(this.existingPurposeId ? 'Propósito actualizado' : 'Propósito creado');
        }
      } else {
        console.error('Error guardando propósito:', purposeRes.reason);
        errorMsgs.push('Propósito: ' + (purposeRes.reason?.message || 'Error al guardar'));
      }

      // Mensaje final
      const title = errorMsgs.length ? 'Resultado mixto' : '¡Guardado!';
      const textParts = [...successMsgs, ...errorMsgs].filter(Boolean).join('. ');

      Swal.fire({
        icon: errorMsgs.length ? 'warning' : 'success',
        title,
        text: textParts,
        confirmButtonColor: '#003660'
      });
    });
  }
}




