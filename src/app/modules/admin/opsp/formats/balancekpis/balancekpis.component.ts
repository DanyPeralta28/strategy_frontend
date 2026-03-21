import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
  selector: 'app-balancekpis',
  imports: [CommonModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
  templateUrl: './balancekpis.component.html',
  styleUrl: './balancekpis.component.scss',
})
export class BalancekpisComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
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
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_balancekpis');
  }

  exportExcel(): void {
    const rows = this.categorias.flatMap((categoria) =>
      (this.kpisBalance[categoria.key] || []).map((item: any, index: number) => ({
        Categoria: categoria.label,
        Numero: index + 1,
        KPI: (item.kpi || '').toString().trim(),
        Resultado: (item.resultado || '').toString().trim(),
        Color: this.getColorLabel(item.color),
        FechaCumplimiento: this.fechaCumplimiento,
      }))
    );

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

  constructor(public opspService: OpspService) {}

  ngOnInit(): void {
    this.loadKpisBalance();
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
    this.opspService
      .getKpiBalancesByCompany(this.id_company)
      .then(resp => {
        if (!resp?.data || resp.data.length === 0) {
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
      })
      .catch(err => {
        console.error('Error cargando KPIs de Balance:', err);
      });
  }

  /** Construye el payload que la API espera */
  private buildPayload(isCreate: boolean): any {
    const mappedKpis: any = {};

    Object.entries(this.uiToApiCategoryMap).forEach(([uiKey, apiKey]) => {
      const list = this.kpisBalance[uiKey] || [];
      mappedKpis[apiKey] = list
        .filter((kpi: any) => {
          // filtro de vacíos parecido a como lo hacías antes
          return (
            (kpi.kpi && kpi.kpi.toString().trim() !== '') ||
            (kpi.resultado && kpi.resultado.toString().trim() !== '') ||
            (kpi.color && kpi.color.toString().trim() !== '')
          );
        })
        .map((kpi: any) => ({
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






