import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-strata',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './strata.component.html',
  styleUrl: './strata.component.scss',
})
export class StrataComponent implements OnInit {
  sevenForm!: FormGroup;

  // contexto / estado
  id_company: string = 'BANRURAL_GT99';
  existingStrataId: number | null = null;
  existingBhagId: number | null = null;
  originalBhagDescription: string = '';
  existingProfitPerXId: number | null = null;
  originalProfitPerXDefinition: string = '';
  centralClientSummary: string = '';
  status = 1;
  created_by = 'admin_user';
  user_name = 'jdoe';

  brandPromiseId?: number;
  existingBrandPromise: {
    primary_promise?: string;
    secondary_promise?: string;
    tertiary_promise?: string;
  } | null = null;

  constructor(private fb: FormBuilder, public opspService: OpspService) { }

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
  }

  private async loadCentralClientSummary(): Promise<void> {
    try {
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
        if (!bhagResp?.data || bhagResp.data.length === 0) return;
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
        if (!resp?.data || resp.data.length === 0) return;
        const p = resp.data[0];
        if (p.id) this.existingProfitPerXId = p.id;
        this.originalProfitPerXDefinition = p.profit_per_x_definition || '';
        this.sevenForm.patchValue({
          profitPerX: this.originalProfitPerXDefinition,
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

  private saveProfitPerXIfNeeded(): Promise<any> {
    const current = (this.sevenForm.get('profitPerX')?.value || '').trim();
    if (!current) return Promise.resolve(null);
    if (this.existingProfitPerXId && current === this.originalProfitPerXDefinition) return Promise.resolve(null);

    const payload: any = {
      profit_per_x_definition: current,
      created_by: this.created_by,
    };

    if (!this.existingProfitPerXId) {
      // creación
      payload.id_company = this.id_company;
      return this.opspService.createProfitPerX(payload).then(res => {
        if (res?.data && res.data[0]?.id) {
          this.existingProfitPerXId = res.data[0].id;
        }
        this.originalProfitPerXDefinition = current;
        return res;
      });
    } else {
      // update
      return this.opspService.updateProfitPerX(this.existingProfitPerXId, payload).then(res => {
        this.originalProfitPerXDefinition = current;
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

    const isCreateStrata = !this.existingStrataId;
    const strataPayload = this.buildStrataPayload(isCreateStrata);
    const strataPromise: Promise<any> = isCreateStrata
      ? this.opspService.createStrata(strataPayload)
      : this.opspService.updateStrata(this.existingStrataId!, strataPayload);

    const bhagPromise = this.saveBhagIfNeeded();
    const profitPerXPromise = this.saveProfitPerXIfNeeded();

    Swal.fire({
      title: 'Guardando...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    Promise.allSettled([strataPromise, bhagPromise, profitPerXPromise]).then(results => {
      const [strataRes, bhagRes, profitRes] = results;
      const successMsgs: string[] = [];
      const errorMsgs: string[] = [];

      if (strataRes.status === 'fulfilled') {
        successMsgs.push(isCreateStrata ? '7 Estratos creado' : '7 Estratos actualizado');
        if (isCreateStrata && strataRes.value?.data && strataRes.value.data[0]?.id) {
          this.existingStrataId = strataRes.value.data[0].id;
        }
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

      if (profitRes.status === 'fulfilled') {
        if (profitRes.value) {
          successMsgs.push(this.existingProfitPerXId ? 'Utilidad por X actualizada' : 'Utilidad por X creada');
        }
      } else {
        console.error('Error guardando Utilidad por X:', profitRes.reason);
        errorMsgs.push('Utilidad por X: ' + (profitRes.reason?.message || 'Error al guardar'));
      }

      const title = errorMsgs.length ? 'Resultado mixto' : '¡Guardado!';
      const textParts = [...successMsgs, ...errorMsgs].filter(Boolean).join('. ');

      Swal.fire({
        icon: errorMsgs.length ? 'warning' : 'success',
        title,
        text: textParts,
        confirmButtonColor: '#003660',
      });
    });
  }
}
