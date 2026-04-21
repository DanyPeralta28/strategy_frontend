import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-balancekpis',
  imports: [CommonModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective, OpspEntityFilterComponent],
  templateUrl: './balancekpis.component.html',
  styleUrl: './balancekpis.component.scss',
})
export class BalancekpisComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  reportRows: Array<{ categoria: string; numero: number; kpi: string; resultado: string; color: string }> = [];
  reportFechaCumplimiento = '';
  categorias = [
    { key: 'empleados', label: 'Empleados' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'accionistas', label: 'Accionistas' },
    { key: 'entrenamiento', label: 'Entrenamiento' },
    { key: 'ventas', label: 'Ventas/Marketing' },
    { key: 'administracion', label: 'Administración' },
  ];
  fechaCumplimiento: string = '';
  minTodayDate = this.getTodayIso();

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    this.refreshReportData();
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_balancekpis');
  }

  exportExcel(): void {
    this.refreshReportData();
    const rows = this.reportRows.map((item) => ({
      Categoria: item.categoria,
      Numero: item.numero,
      KPI: item.kpi,
      Resultado: item.resultado,
      Color: item.color,
      FechaCumplimiento: this.reportFechaCumplimiento,
    }));

    void exportSheetsToExcel('opsp_balancekpis', [
      {
        name: 'Balance KPIs',
        rows,
        widths: [24, 10, 48, 20, 18, 18],
      },
    ]);
  }

  private getColorLabel(color: string): string {
    switch (color) {
      case 'dark-green':
        return 'Super Verde';
      case 'light-green':
        return 'Verde';
      case 'red':
        return 'Rojo';
      default:
        return '';
    }
  }

  kpisBalance: any = {
    empleados: [this.createKpi()],
    clientes: [this.createKpi()],
    accionistas: [this.createKpi()],
    entrenamiento: [this.createKpi()],
    ventas: [this.createKpi()],
    administracion: [this.createKpi()],
  };

  // contexto
  id_company = getSessionCompanyId(); // reemplaza según flujo real
  existingKpiBalanceId: number | null = null;
  created_by = getSessionUserId();

  constructor(
    public opspService: OpspService,
    private opspEntityContextService: OpspEntityContextService
  ) {}

  ngOnInit(): void {
    this.loadKpisBalance();
    this.opspEntityContextService.entityChanges$.subscribe(() => this.loadKpisBalance());
  }

  private getTodayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  createKpi() {
    return { kpi: '', resultado: '', color: '' };
  }

  private isKpiEmpty(item: any): boolean {
    return !item || (
      (item.kpi || '').toString().trim() === '' &&
      (item.resultado || '').toString().trim() === '' &&
      (item.color || '').toString().trim() === ''
    );
  }

  private isKpiComplete(item: any): boolean {
    return !!item &&
      (item.kpi || '').toString().trim() !== '' &&
      (item.resultado || '').toString().trim() !== '' &&
      (item.color || '').toString().trim() !== '';
  }

  private hasPartialKpi(item: any): boolean {
    return !this.isKpiEmpty(item) && !this.isKpiComplete(item);
  }

  getCompleteKpis(categoryKey: string): any[] {
    return (this.kpisBalance[categoryKey] || []).filter((item: any) => this.isKpiComplete(item));
  }

  refreshReportData(): void {
    this.reportFechaCumplimiento = this.fechaCumplimiento || '';
    this.reportRows = this.categorias.flatMap((categoria) =>
      this.getCompleteKpis(categoria.key).map((item: any, index: number) => ({
        categoria: categoria.label,
        numero: index + 1,
        kpi: (item.kpi || '').toString().trim(),
        resultado: (item.resultado || '').toString().trim(),
        color: this.getColorLabel(item.color),
      }))
    );
  }

  agregarKPI(key: string): void {
    this.kpisBalance[key].push({
      kpi: '',
      resultado: '',
      color: '',
    });
  }

  eliminarKPI(key: string, index: number): void {
    if (this.kpisBalance[key].length > 1) {
      this.kpisBalance[key].splice(index, 1);
    }
  }

  getColorSelectClass(color: string): string {
    switch (color) {
      case 'dark-green':
        return 'bg-[#006600] text-white border-[#006600]';
      case 'light-green':
        return 'bg-[#66CC66] text-slate-900 border-[#66CC66]';
      case 'red':
        return 'bg-[#CC0000] text-white border-[#CC0000]';
      default:
        return 'bg-white text-slate-700 border-gray-300';
    }
  }

  /** Mapeos entre UI y API */
  private uiToApiCategoryMap: Record<string, string> = {
    empleados: 'employees',
    clientes: 'customers',
    accionistas: 'shareholders',
    entrenamiento: 'training',
    ventas: 'sales',
    administracion: 'administration',
  };

  private backendToUiCategoryMap: Record<string, string> = {
    employee_balance: 'empleados',
    customer_balance: 'clientes',
    shareholder_balance: 'accionistas',
    training_balance: 'entrenamiento',
    sales_marketing_balance: 'ventas',
    administration_balance: 'administracion',
  };

  private apiToUiColor: Record<string, string> = {
    'dark-green': 'dark-green', // ya usamos directamente los valores API en UI
    'light-green': 'light-green',
    yellow: 'red', // compatibilidad con datos antiguos
    red: 'red',
  };

  private uiToApiColor: Record<string, string> = {
    'dark-green': 'dark-green',
    'light-green': 'light-green',
    red: 'red',
  };

  /** Carga existente */
  loadKpisBalance(): void {
    this.existingKpiBalanceId = null;
    this.fechaCumplimiento = '';
    Object.keys(this.kpisBalance).forEach((key) => {
      this.kpisBalance[key] = [this.createKpi()];
    });

    this.opspService
      .getKpiBalancesByCompany(this.id_company)
      .then(resp => {
        if (!resp?.data || resp.data.length === 0) {
          this.refreshReportData();
          return; // no hay datos previos: quedan los defaults
        }

        const data = resp.data[0];
        if (data.id) {
          this.existingKpiBalanceId = data.id;
        }
        if (data.compliance_date) {
          this.fechaCumplimiento = data.compliance_date;
        }

        // Reemplaza cada categoría si viene
        Object.entries(this.backendToUiCategoryMap).forEach(([backendKey, uiKey]) => {
          const arrayFromBackend = (data as any)[backendKey] || [];
          if (Array.isArray(arrayFromBackend)) {
            // reasignar con mapeo de campos
            this.kpisBalance[uiKey] = arrayFromBackend.map((item: any) => ({
              kpi: item.kpi || '',
              resultado: item.result || '',
              color: this.apiToUiColor[item.color] || '',
            }));
            // Asegurar al menos uno si quedó vacío
            if (this.kpisBalance[uiKey].length === 0) {
              this.kpisBalance[uiKey] = [this.createKpi()];
            }
          }
        });
        this.refreshReportData();
      })
      .catch(err => {
        console.error('Error cargando KPIs de Balance:', err);
        this.refreshReportData();
      });
  }

  /** Construye el payload que la API espera */
  private buildPayload(isCreate: boolean): any {
    const mappedKpis: any = {};

    Object.entries(this.uiToApiCategoryMap).forEach(([uiKey, apiKey]) => {
      const list = this.getCompleteKpis(uiKey);
      mappedKpis[apiKey] = list.map((kpi: any) => ({
        kpi: kpi.kpi,
        result: kpi.resultado,
        color: this.uiToApiColor[kpi.color] || '',
      }));
    });

    const payload: any = {
      kpis: mappedKpis,
      compliance_date: this.fechaCumplimiento,
      created_by: this.created_by,
    };

    if (isCreate) {
      payload.id_company = this.id_company;
    }

    return payload;
  }

  /** Guardado (create/update) */
  guardarKPIs(): void {
    // Validación mínima: al menos fecha
    if (!this.fechaCumplimiento) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta fecha',
        text: 'Por favor proporciona la fecha de cumplimiento.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    if (this.fechaCumplimiento < this.minTodayDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha no permitida',
        text: 'La fecha de cumplimiento no puede ser anterior a la fecha actual.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    const hasPartialRows = this.categorias.some((categoria) =>
      (this.kpisBalance[categoria.key] || []).some((item: any) => this.hasPartialKpi(item))
    );

    if (hasPartialRows) {
      Swal.fire({
        icon: 'warning',
        title: 'KPIs incompletos',
        text: 'Completa KPI, resultado y color en cada fila iniciada antes de guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    const totalCompleteKpis = this.categorias.reduce(
      (total, categoria) => total + this.getCompleteKpis(categoria.key).length,
      0
    );

    if (totalCompleteKpis === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin KPIs',
        text: 'Agrega al menos un KPI completo antes de guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    const isCreate = !this.existingKpiBalanceId;
    const payload = this.buildPayload(isCreate);

    Swal.fire({
      title: isCreate ? 'Creando...' : 'Actualizando...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    const promise: Promise<any> = isCreate
      ? this.opspService.createKpiBalance(payload)
      : this.opspService.updateKpiBalance(this.existingKpiBalanceId!, payload);

    promise
      .then(res => {
        if (isCreate && res?.data && res.data[0]?.id) {
          this.existingKpiBalanceId = res.data[0].id;
        }
        this.refreshReportData();
        Swal.fire({
          icon: 'success',
          title: isCreate ? '¡Creado!' : '¡Actualizado!',
          text: 'KPIs de Balance guardados correctamente.',
          confirmButtonColor: '#003660',
        });
      })
      .catch(err => {
        console.error('Error guardando KPIs de Balance:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F',
        });
      });
  }
}







