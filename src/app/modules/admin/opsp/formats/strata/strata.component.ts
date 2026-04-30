import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';
import { OpspEntityContextService } from 'app/modules/admin/services/opsp-entity-context.service';
import { OpspEntityFilterComponent } from '../../components/opsp-entity-filter/opsp-entity-filter.component';

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
  selector: 'app-strata',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective, OpspEntityFilterComponent],
  templateUrl: './strata.component.html',
  styleUrl: './strata.component.scss',
})
export class StrataComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  sevenForm!: FormGroup;

  // contexto / estado
  id_company = getSessionCompanyId();
  existingStrataId: number | null = null;
  existingBhagId: number | null = null;
  originalBhagDescription: string = '';
  centralClientSummary: string = '';
  status = 1;
  created_by = getSessionUserId();
  user_name = 'jdoe';

  brandPromiseId?: number;
  existingBrandPromise: {
    primary_promise?: string;
    secondary_promise?: string;
    tertiary_promise?: string;
  } | null = null;

  constructor(
    private fb: FormBuilder,
    public opspService: OpspService,
    private opspEntityContextService: OpspEntityContextService
  ) { }

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_strata');
  }

  exportExcel(): void {
    const resumenRows = [
      { Campo: 'Palabras propias', Valor: (this.sevenForm.get('uniqueWords')?.value || '').toString().trim() },
      { Campo: 'Cliente central', Valor: (this.centralClientSummary || '').toString().trim() },
      { Campo: 'Que', Valor: (this.sevenForm.get('brandTerritory.what')?.value || '').toString().trim() },
      { Campo: 'Donde', Valor: (this.sevenForm.get('brandTerritory.where')?.value || '').toString().trim() },
      { Campo: 'Promesa lider', Valor: (this.sevenForm.get('brandTerritory.promises')?.value || '').toString().trim() },
      { Campo: 'Garantia de marca', Valor: (this.sevenForm.get('brandGuarantee')?.value || '').toString().trim() },
      { Campo: 'Estrategia', Valor: (this.sevenForm.get('strategy')?.value || '').toString().trim() },
      { Campo: 'Factor X', Valor: (this.sevenForm.get('factorX')?.value || '').toString().trim() },
      { Campo: 'Utilidad por X', Valor: (this.sevenForm.get('profitPerX')?.value || '').toString().trim() },
      { Campo: 'BHAG', Valor: (this.sevenForm.get('bhag')?.value || '').toString().trim() },
    ];

    const diferenciadores = this.differentiators.controls.map((group, index) => ({
      Numero: index + 1,
      Titulo: (group.get('title')?.value || '').toString().trim(),
      Descripcion: (group.get('value')?.value || '').toString().trim(),
    }));

    void exportSheetsToExcel('opsp_strata', [
      {
        name: 'Resumen',
        rows: resumenRows,
        widths: [24, 90],
      },
      {
        name: 'Diferenciadores',
        rows: diferenciadores,
        widths: [10, 34, 90],
      },
    ]);
  }

  ngOnInit(): void {
    this.sevenForm = this.fb.group({
      uniqueWords: [''],
      brandTerritory: this.fb.group({
        customer: [''],
        what: [''],
        where: [''],
        promises: [''],
      }),
      brandGuarantee: [''],
      strategy: [''],
      differentiators: this.fb.array([]),
      factorX: [''],
      profitPerX: [''], // utilidad por X
      bhag: [''],
    });

    this.loadStrata();
    this.loadCentralClientSummary();
    this.loadBrandPromise();
    this.loadBhag();
    this.loadProfitPerX();
    this.opspEntityContextService.entityChanges$.subscribe(() => {
      this.loadStrata();
      this.loadCentralClientSummary();
      this.loadBrandPromise();
      this.loadBhag();
      this.loadProfitPerX();
    });
  }

  private async loadCentralClientSummary(): Promise<void> {
    try {
      this.centralClientSummary = '';
      const resp = await this.opspService.getCentralClientByCompany(this.id_company);
      if (resp?.data && resp.data.length > 0) {
        this.centralClientSummary = resp.data[0].core_client_summary || '';
      }
    } catch (err) {
      console.error('Error cargando resumen del Cliente Central:', err);
    }
  }

  private async loadBrandPromise(): Promise<void> {
    try {
      this.brandPromiseId = undefined;
      this.existingBrandPromise = null;
      const resp = await this.opspService.getBrandPromiseByCompany(this.id_company);
      if (resp?.data && resp.data.length > 0) {
        const bp = resp.data[0];
        this.brandPromiseId = bp.id;
        this.existingBrandPromise = {
          primary_promise: bp.primary_promise,
          secondary_promise: bp.secondary_promise,
          tertiary_promise: bp.tertiary_promise
        };
        this.sevenForm.get('brandTerritory.promises')?.setValue(bp.primary_promise || '');
      }
    } catch (err) {
      console.error('Error cargando Promesa Líder:', err);
    }
  }

  /** ---------- getters ---------- */
  get differentiators(): FormArray {
    return this.sevenForm.get('differentiators') as FormArray;
  }

  /** ---------- helpers ---------- */
  private createDifferentiatorGroup(title = '', value = ''): FormGroup {
    return this.fb.group({
      title: [title],
      value: [value],
    });
  }

  addDifferentiator(): void {
    this.differentiators.push(this.createDifferentiatorGroup());
  }

  removeDifferentiator(index: number): void {
    this.differentiators.removeAt(index);
  }

  trackByIndex(_index: number, _item: any): number {
    return _index;
  }

  /** ---------- load 7 estratos ---------- */
  loadStrata(): void {
    this.opspService
      .getStrataByCompany(this.id_company)
      .then(resp => {
        if (!resp?.data || resp.data.length === 0) {
          this.existingStrataId = null;
          this.sevenForm.reset();
          this.differentiators.clear();
          this.addDifferentiator();
          // no hay datos previos, dejamos el array vacío para que se vea "No hay actividades aún."
          return;
        }

        const data = resp.data[0];

        if (data.id) {
          this.existingStrataId = data.id;
        }
        if (typeof data.status !== 'undefined') {
          this.status = data.status;
        }
        if (data.created_by) {
          this.created_by = data.created_by;
        }

        this.sevenForm.patchValue({
          uniqueWords: data.own_words || '',
          brandGuarantee: data.brand_promise_guarantee || '',
          strategy: data.strategy_one_liner || '',
          factorX: data.factor_x_advantage || '',
          // profitPerX y bhag se manejan aparte
        });

        this.sevenForm.get('brandTerritory')?.patchValue({
          what: data.products_and_services || '',
          where: data.geographic_area || '',
        });

        this.differentiators.clear();
        const diffs = Array.isArray(data.diff_acitivities) ? data.diff_acitivities : [];
        if (diffs.length) {
          diffs.forEach((d: any) => {
            this.differentiators.push(
              this.createDifferentiatorGroup(d.title || '', d.value || '')
            );
          });
        }
      })
      .catch(err => {
        console.error('Error cargando 7 Estratos:', err);
      });
  }

  /** ---------- load BHAG ---------- */
  loadBhag(): void {
    this.opspService
      .getBhagByCompany(this.id_company)
      .then(bhagResp => {
        if (!bhagResp?.data || bhagResp.data.length === 0) {
          this.existingBhagId = null;
          this.originalBhagDescription = '';
          this.sevenForm.patchValue({ bhag: '' });
          return;
        }
        const b = bhagResp.data[0];
        if (b.id) this.existingBhagId = b.id;
        this.originalBhagDescription = b.description || '';
        this.sevenForm.patchValue({
          bhag: this.originalBhagDescription,
        });
      })
      .catch(err => {
        console.error('Error cargando BHAG en 7 Estratos:', err);
      });
  }

  /** ---------- load ProfitPerX (Utilidad por X) ---------- */
  loadProfitPerX(): void {
    this.opspService
      .getProfitPerXByCompany(this.id_company)
      .then(resp => {
        if (!resp?.data || resp.data.length === 0) {
          this.sevenForm.patchValue({ profitPerX: '' });
          return;
        }
        const p = resp.data[0];
        const valueResult = p.value_result ?? '';
        this.sevenForm.patchValue({
          profitPerX: valueResult.toString(),
        });
      })
      .catch(err => {
        console.error('Error cargando Utilidad por X:', err);
      });
  }

  /** ---------- payload builders ---------- */
  private buildDiffActivities(): any[] {
    return this.differentiators.value.map((d: any) => ({
      title: d.title || '',
      value: d.value || '',
    }));
  }

  private buildStrataPayload(isCreate: boolean): any {
    const f = this.sevenForm.value;

    const base: any = {
      own_words: f.uniqueWords,
      products_and_services: f.brandTerritory?.what,
      geographic_area: f.brandTerritory?.where,
      brand_promise_guarantee: f.brandGuarantee,
      strategy_one_liner: f.strategy,
      diff_acitivities: this.buildDiffActivities(),
      factor_x_advantage: f.factorX,
      status: this.status,
      created_by: this.created_by,
    };

    if (isCreate) {
      base.id_company = this.id_company;
    }

    return base;
  }

  private async resolveExistingStrataId(): Promise<void> {
    if (this.existingStrataId) return;
    const resp = await this.opspService.getStrataByCompany(this.id_company);
    const data = Array.isArray(resp?.data) ? resp.data[0] : null;
    if (data?.id) {
      this.existingStrataId = data.id;
    }
  }

  private async persistStrataPayload(payload: any): Promise<any> {
    if (this.existingStrataId) {
      return this.opspService.updateStrata(this.existingStrataId, payload);
    }

    try {
      const createRes = await this.opspService.createStrata(payload);
      if (createRes?.data?.[0]?.id) {
        this.existingStrataId = createRes.data[0].id;
      }
      return createRes;
    } catch (error: any) {
      // Fallback: if create fails because record exists, retry as update.
      if (error?.status === 400) {
        await this.resolveExistingStrataId();
        if (this.existingStrataId) {
          return this.opspService.updateStrata(this.existingStrataId, this.buildStrataPayload(false));
        }
      }
      throw error;
    }
  }

  private saveBhagIfNeeded(): Promise<any> {
    const currentBhag = (this.sevenForm.get('bhag')?.value || '').trim();
    if (!currentBhag) return Promise.resolve(null);
    if (this.existingBhagId && currentBhag === this.originalBhagDescription) return Promise.resolve(null);

    if (this.existingBhagId) {
      return this.opspService
        .updateBhag(this.existingBhagId, {
          description: currentBhag,
          created_by: this.created_by,
        })
        .then(res => {
          this.originalBhagDescription = currentBhag;
          return res;
        });
    } else {
      const obj: any = {
        id_company: this.id_company,
        description: currentBhag,
        created_by: this.created_by,
      };
      return this.opspService.createBhag(obj).then(res => {
        if (res?.data && res.data[0]?.id) {
          this.existingBhagId = res.data[0].id;
        }
        this.originalBhagDescription = currentBhag;
        return res;
      });
    }
  }
  /** ---------- save todo junto ---------- */
  save(): void {
    if (this.sevenForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa los campos requeridos.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    this.resolveExistingStrataId()
      .then(() => {
        const wasCreate = !this.existingStrataId;
        const strataPayload = this.buildStrataPayload(wasCreate);
        const strataPromise = this.persistStrataPayload(strataPayload);
        const bhagPromise = this.saveBhagIfNeeded();
        return Promise.allSettled([strataPromise, bhagPromise]);
      })
      .then(results => {
      const [strataRes, bhagRes] = results;
      const successMsgs: string[] = [];
      const errorMsgs: string[] = [];

      if (strataRes.status === 'fulfilled') {
        successMsgs.push('7 Estratos guardado');
      } else {
        console.error('Error guardando 7 Estratos:', strataRes.reason);
        errorMsgs.push('7 Estratos: ' + (strataRes.reason?.message || 'Error al guardar'));
      }

      if (bhagRes.status === 'fulfilled') {
        if (bhagRes.value) {
          successMsgs.push(this.existingBhagId ? 'BHAG actualizado' : 'BHAG creado');
        }
      } else {
        console.error('Error guardando BHAG:', bhagRes.reason);
        errorMsgs.push('BHAG: ' + (bhagRes.reason?.message || 'Error al guardar'));
      }

      const title = errorMsgs.length ? 'Resultado mixto' : '¡Guardado!';
      const textParts = [...successMsgs, ...errorMsgs].filter(Boolean).join('. ');

      Swal.fire({
        icon: errorMsgs.length ? 'warning' : 'success',
        title,
        text: textParts,
        confirmButtonColor: '#003660',
      });
      })
      .catch(err => {
        console.error('Error preparando guardado de 7 Estratos:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo preparar el guardado de 7 Estratos.',
          confirmButtonColor: '#003660',
        });
      });
  }
}




