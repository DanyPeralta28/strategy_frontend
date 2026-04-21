import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';
import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';
import { OpspEntityContextService } from 'app/modules/admin/services/opsp-entity-context.service';
import { OpspEntityFilterComponent } from '../../components/opsp-entity-filter/opsp-entity-filter.component';

interface ProfitPerXForm {
  definitionUtility: string;
  definitionX: string;
  valueUtility: number | null;
  valueX: number | null;
  valueResult: number | null;
}

@Component({
  selector: 'app-utilidadx',
  standalone: true,
  imports: [CommonModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective, OpspEntityFilterComponent],
  templateUrl: './utilidadx.component.html',
  styleUrl: './utilidadx.component.scss'
})
export class UtilidadxComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;

  id_company = getSessionCompanyId();
  id_entity = getSessionEntityId();
  created_by = getSessionUserId();
  existingId: number | null = null;

  form: ProfitPerXForm = this.createEmptyForm();
  private originalSnapshot = '';

  constructor(
    private opspService: OpspService,
    private opspEntityContextService: OpspEntityContextService
  ) {}

  get currentEntityId(): number | string {
    return this.opspEntityContextService.getCurrentEntityId();
  }

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  get resultPreview(): string {
    const result = this.computedResult != null ? this.formatNumber(this.computedResult) : '0';
    const xLabel = this.form.definitionX.trim() || '[X]';
    return `Motor Economico = $${result} por ${xLabel}`;
  }

  get computedResult(): number | null {
    if (this.form.valueUtility == null || this.form.valueX == null) {
      return null;
    }
    const utility = Number(this.form.valueUtility);
    const x = Number(this.form.valueX);
    if (!Number.isFinite(utility) || !Number.isFinite(x)) {
      return null;
    }
    return utility * x;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_utilidadx');
  }

  exportExcel(): void {
    void exportSheetsToExcel('opsp_utilidadx', [
      {
        name: 'Utilidad por X',
        rows: [
          { Campo: 'Definicion Utilidad', Valor: this.form.definitionUtility.trim() },
          { Campo: 'Definicion X', Valor: this.form.definitionX.trim() },
          { Campo: 'Valor Utilidad', Valor: this.form.valueUtility != null ? `$${this.form.valueUtility}` : '' },
          { Campo: 'Valor X', Valor: this.form.valueX != null ? `$${this.form.valueX}` : '' },
          { Campo: 'Resultado', Valor: this.computedResult != null ? `$${this.computedResult}` : '' },
        ],
        widths: [32, 90],
      },
    ]);
  }

  ngOnInit(): void {
    this.loadUtilidadPorX();
    this.opspEntityContextService.entityChanges$.subscribe(() => this.loadUtilidadPorX());
  }

  private createEmptyForm(): ProfitPerXForm {
    return {
      definitionUtility: '',
      definitionX: '',
      valueUtility: null,
      valueX: null,
      valueResult: null,
    };
  }

  private loadUtilidadPorX(): void {
    this.opspService
      .getProfitPerXByCompany(this.id_company)
      .then((resp) => {
        if (!resp?.data || resp.data.length === 0) {
          this.form = this.createEmptyForm();
          this.originalSnapshot = this.buildSnapshot();
          return;
        }

        const rec = resp.data[0];
        this.existingId = rec?.id ?? null;
        this.form = {
          definitionUtility: (rec?.definition_utility ?? '').toString().trim(),
          definitionX: (rec?.definition_x ?? '').toString().trim(),
          valueUtility: this.toNumberOrNull(rec?.value_utility),
          valueX: this.toNumberOrNull(rec?.value_x),
          valueResult: null,
        };
        this.originalSnapshot = this.buildSnapshot();
      })
      .catch((err) => {
        console.error('Error cargando Utilidad por X:', err);
      });
  }

  guardar(): void {
    if (!this.isValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa las definiciones y los valores numericos de Utilidad por X.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    if (this.existingId && this.buildSnapshot() === this.originalSnapshot) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron cambios para guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const payload = {
      definition_utility: this.form.definitionUtility.trim(),
      definition_x: this.form.definitionX.trim(),
      value_utility: Number(this.form.valueUtility),
      value_x: Number(this.form.valueX),
      value_result: Number(this.computedResult),
      created_by: this.created_by,
    };

    let request: Promise<any>;
    if (this.existingId) {
      request = this.opspService.updateProfitPerX(this.existingId, payload);
    } else {
        request = this.opspService.createProfitPerX({
        id_company: this.id_company,
        id_entity: this.currentEntityId,
        ...payload,
      });
    }

    void Swal.fire({
      title: this.existingId ? 'Actualizando...' : 'Guardando...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    request
      .then((res) => {
        if (!this.existingId) {
          const createdId = res?.data?.[0]?.id ?? res?.data?.id ?? null;
          if (createdId != null) {
            this.existingId = Number(createdId);
          }
        }

        this.originalSnapshot = this.buildSnapshot();
        void Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'Utilidad por X se guardo correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch((err) => {
        console.error('Error guardando Utilidad por X:', err);
        void Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }

  private isValid(): boolean {
    return !!this.form.definitionUtility.trim()
      && !!this.form.definitionX.trim()
      && this.form.valueUtility != null
      && this.form.valueX != null
      && this.computedResult != null;
  }

  private buildSnapshot(): string {
    return JSON.stringify({
      definitionUtility: this.form.definitionUtility.trim(),
      definitionX: this.form.definitionX.trim(),
      valueUtility: this.form.valueUtility,
      valueX: this.form.valueX,
      valueResult: this.computedResult,
    });
  }

  private toNumberOrNull(value: any): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
