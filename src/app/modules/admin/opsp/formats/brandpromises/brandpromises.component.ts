import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-brandpromises',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective, OpspEntityFilterComponent],
  templateUrl: './brandpromises.component.html',
  styleUrl: './brandpromises.component.scss'
})
export class BrandpromisesComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  clienteCentral = '';
  promesaLider = '';
  promesa2 = '';
  promesa3 = '';
  primaryKpiType = '';
  primaryKpiTypeNumber = '';
  primaryKpiSuperGreen: number | null = null;
  primaryKpiGreen: number | null = null;
  primaryKpiRed: number | null = null;
  secondaryKpiType = '';
  secondaryKpiTypeNumber = '';
  secondaryKpiSuperGreen: number | null = null;
  secondaryKpiGreen: number | null = null;
  secondaryKpiRed: number | null = null;
  tertiaryKpiType = '';
  tertiaryKpiTypeNumber = '';
  tertiaryKpiSuperGreen: number | null = null;
  tertiaryKpiGreen: number | null = null;
  tertiaryKpiRed: number | null = null;

  id?: number;
  centralClientId?: number;

  id_company = getSessionCompanyId();

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_brandpromises');
  }

  exportExcel(): void {
    void exportSheetsToExcel('opsp_brandpromises', [
      {
        name: 'Promesas de Marca',
        rows: [
          { Campo: 'Cliente Central', Valor: this.clienteCentral.trim() },
          { Campo: 'Promesa Lider', Valor: this.promesaLider.trim() },
          { Campo: 'Promesa Lider - Tipo KPI', Valor: this.primaryKpiType },
          { Campo: 'Promesa Lider - Tipo numerico KPI', Valor: this.primaryKpiTypeNumber },
          { Campo: 'Promesa Lider - Super Verde', Valor: this.primaryKpiSuperGreen },
          { Campo: 'Promesa Lider - Verde', Valor: this.primaryKpiGreen },
          { Campo: 'Promesa Lider - Rojo', Valor: this.primaryKpiRed },
          { Campo: 'Promesa 2', Valor: this.promesa2.trim() },
          { Campo: 'Promesa 2 - Tipo KPI', Valor: this.secondaryKpiType },
          { Campo: 'Promesa 2 - Tipo numerico KPI', Valor: this.secondaryKpiTypeNumber },
          { Campo: 'Promesa 2 - Super Verde', Valor: this.secondaryKpiSuperGreen },
          { Campo: 'Promesa 2 - Verde', Valor: this.secondaryKpiGreen },
          { Campo: 'Promesa 2 - Rojo', Valor: this.secondaryKpiRed },
          { Campo: 'Promesa 3', Valor: this.promesa3.trim() },
          { Campo: 'Promesa 3 - Tipo KPI', Valor: this.tertiaryKpiType },
          { Campo: 'Promesa 3 - Tipo numerico KPI', Valor: this.tertiaryKpiTypeNumber },
          { Campo: 'Promesa 3 - Super Verde', Valor: this.tertiaryKpiSuperGreen },
          { Campo: 'Promesa 3 - Verde', Valor: this.tertiaryKpiGreen },
          { Campo: 'Promesa 3 - Rojo', Valor: this.tertiaryKpiRed },
        ],
        widths: [24, 90],
      },
    ]);
  }
  created_by = getSessionUserId();

  private originalSnapshot = {
    clienteCentral: '',
    promesaLider: '',
    promesa2: '',
    promesa3: '',
    primaryKpiType: '',
    primaryKpiTypeNumber: '',
    primaryKpiSuperGreen: null as number | null,
    primaryKpiGreen: null as number | null,
    primaryKpiRed: null as number | null,
    secondaryKpiType: '',
    secondaryKpiTypeNumber: '',
    secondaryKpiSuperGreen: null as number | null,
    secondaryKpiGreen: null as number | null,
    secondaryKpiRed: null as number | null,
    tertiaryKpiType: '',
    tertiaryKpiTypeNumber: '',
    tertiaryKpiSuperGreen: null as number | null,
    tertiaryKpiGreen: null as number | null,
    tertiaryKpiRed: null as number | null
  };

  constructor(
    public opspService: OpspService,
    private opspEntityContextService: OpspEntityContextService
  ) {}

  ngOnInit(): void {
    this.loadBrandPromises();
    this.opspEntityContextService.entityChanges$.subscribe(() => this.loadBrandPromises());
  }

  async loadBrandPromises(): Promise<void> {
    try {
      this.id = null as any;
      this.centralClientId = null as any;
      this.clienteCentral = '';
      this.promesaLider = '';
      this.promesa2 = '';
      this.promesa3 = '';
      this.primaryKpiType = '';
      this.primaryKpiTypeNumber = '';
      this.primaryKpiSuperGreen = null;
      this.primaryKpiGreen = null;
      this.primaryKpiRed = null;
      this.secondaryKpiType = '';
      this.secondaryKpiTypeNumber = '';
      this.secondaryKpiSuperGreen = null;
      this.secondaryKpiGreen = null;
      this.secondaryKpiRed = null;
      this.tertiaryKpiType = '';
      this.tertiaryKpiTypeNumber = '';
      this.tertiaryKpiSuperGreen = null;
      this.tertiaryKpiGreen = null;
      this.tertiaryKpiRed = null;

      const [brandResp, centralResp] = await Promise.all([
        this.opspService.getBrandPromiseByCompany(this.id_company),
        this.opspService.getCentralClientByCompany(this.id_company)
      ]);

      if (brandResp?.data?.length) {
        const existing = brandResp.data[0];
        this.id = existing.id;
        this.promesaLider = existing.primary_promise || '';
        this.promesa2 = existing.secondary_promise || '';
        this.promesa3 = existing.tertiary_promise || '';
        this.primaryKpiType = existing.primary_kpi_type || '';
        this.primaryKpiTypeNumber = existing.primary_kpi_type_number || '';
        this.primaryKpiSuperGreen = this.toNullableNumber(existing.primary_kpi_super_green);
        this.primaryKpiGreen = this.toNullableNumber(existing.primary_kpi_green);
        this.primaryKpiRed = this.toNullableNumber(existing.primary_kpi_red);
        this.secondaryKpiType = existing.secondary_kpi_type || '';
        this.secondaryKpiTypeNumber = existing.secondary_kpi_type_number || '';
        this.secondaryKpiSuperGreen = this.toNullableNumber(existing.secondary_kpi_super_green);
        this.secondaryKpiGreen = this.toNullableNumber(existing.secondary_kpi_green);
        this.secondaryKpiRed = this.toNullableNumber(existing.secondary_kpi_red);
        this.tertiaryKpiType = existing.tertiary_kpi_type || '';
        this.tertiaryKpiTypeNumber = existing.tertiary_kpi_type_number || '';
        this.tertiaryKpiSuperGreen = this.toNullableNumber(existing.tertiary_kpi_super_green);
        this.tertiaryKpiGreen = this.toNullableNumber(existing.tertiary_kpi_green);
        this.tertiaryKpiRed = this.toNullableNumber(existing.tertiary_kpi_red);
      }

      if (centralResp?.data?.length) {
        const existingCentral = centralResp.data[0];
        this.centralClientId = existingCentral.id;
        this.clienteCentral = existingCentral.core_client_summary || '';
      }

      this.originalSnapshot = {
        clienteCentral: this.clienteCentral,
        promesaLider: this.promesaLider,
        promesa2: this.promesa2,
        promesa3: this.promesa3,
        primaryKpiType: this.primaryKpiType,
        primaryKpiTypeNumber: this.primaryKpiTypeNumber,
        primaryKpiSuperGreen: this.primaryKpiSuperGreen,
        primaryKpiGreen: this.primaryKpiGreen,
        primaryKpiRed: this.primaryKpiRed,
        secondaryKpiType: this.secondaryKpiType,
        secondaryKpiTypeNumber: this.secondaryKpiTypeNumber,
        secondaryKpiSuperGreen: this.secondaryKpiSuperGreen,
        secondaryKpiGreen: this.secondaryKpiGreen,
        secondaryKpiRed: this.secondaryKpiRed,
        tertiaryKpiType: this.tertiaryKpiType,
        tertiaryKpiTypeNumber: this.tertiaryKpiTypeNumber,
        tertiaryKpiSuperGreen: this.tertiaryKpiSuperGreen,
        tertiaryKpiGreen: this.tertiaryKpiGreen,
        tertiaryKpiRed: this.tertiaryKpiRed
      };
    } catch (err) {
      console.error('Error cargando Promesa de Marca / Cliente Central:', err);
    }
  }

  private hasChanges(): boolean {
    return (
      this.clienteCentral.trim() !== this.originalSnapshot.clienteCentral.trim() ||
      this.promesaLider.trim() !== this.originalSnapshot.promesaLider.trim() ||
      this.promesa2.trim() !== this.originalSnapshot.promesa2.trim() ||
      this.promesa3.trim() !== this.originalSnapshot.promesa3.trim() ||
      this.primaryKpiType !== this.originalSnapshot.primaryKpiType ||
      this.primaryKpiTypeNumber !== this.originalSnapshot.primaryKpiTypeNumber ||
      this.primaryKpiSuperGreen !== this.originalSnapshot.primaryKpiSuperGreen ||
      this.primaryKpiGreen !== this.originalSnapshot.primaryKpiGreen ||
      this.primaryKpiRed !== this.originalSnapshot.primaryKpiRed ||
      this.secondaryKpiType !== this.originalSnapshot.secondaryKpiType ||
      this.secondaryKpiTypeNumber !== this.originalSnapshot.secondaryKpiTypeNumber ||
      this.secondaryKpiSuperGreen !== this.originalSnapshot.secondaryKpiSuperGreen ||
      this.secondaryKpiGreen !== this.originalSnapshot.secondaryKpiGreen ||
      this.secondaryKpiRed !== this.originalSnapshot.secondaryKpiRed ||
      this.tertiaryKpiType !== this.originalSnapshot.tertiaryKpiType ||
      this.tertiaryKpiTypeNumber !== this.originalSnapshot.tertiaryKpiTypeNumber ||
      this.tertiaryKpiSuperGreen !== this.originalSnapshot.tertiaryKpiSuperGreen ||
      this.tertiaryKpiGreen !== this.originalSnapshot.tertiaryKpiGreen ||
      this.tertiaryKpiRed !== this.originalSnapshot.tertiaryKpiRed
    );
  }

  save(): void {
    const promiseConfigs = [
      {
        nombre: 'Promesa lider',
        promesa: this.promesaLider.trim(),
        tipo: this.primaryKpiType,
        tipoNumerico: this.primaryKpiTypeNumber,
        superVerde: this.primaryKpiSuperGreen,
        verde: this.primaryKpiGreen,
        rojo: this.primaryKpiRed,
      },
      {
        nombre: 'Promesa 2',
        promesa: this.promesa2.trim(),
        tipo: this.secondaryKpiType,
        tipoNumerico: this.secondaryKpiTypeNumber,
        superVerde: this.secondaryKpiSuperGreen,
        verde: this.secondaryKpiGreen,
        rojo: this.secondaryKpiRed,
      },
      {
        nombre: 'Promesa 3',
        promesa: this.promesa3.trim(),
        tipo: this.tertiaryKpiType,
        tipoNumerico: this.tertiaryKpiTypeNumber,
        superVerde: this.tertiaryKpiSuperGreen,
        verde: this.tertiaryKpiGreen,
        rojo: this.tertiaryKpiRed,
      },
    ];

    for (const config of promiseConfigs) {
      const hasAnyKpiField =
        config.tipo !== '' ||
        config.tipoNumerico !== '' ||
        config.superVerde !== null ||
        config.verde !== null ||
        config.rojo !== null;

      if (config.promesa && (!config.tipo || !config.tipoNumerico || config.superVerde === null || config.verde === null || config.rojo === null)) {
        void Swal.fire({
          icon: 'warning',
          title: 'KPI incompleto',
          text: `${config.nombre} debe tener tipo, tipo numerico y los tres valores de color.`,
          confirmButtonColor: '#003660'
        });
        return;
      }

      if (!config.promesa && hasAnyKpiField) {
        void Swal.fire({
          icon: 'warning',
          title: 'Promesa incompleta',
          text: `${config.nombre} debe tener texto de promesa antes de configurar su KPI.`,
          confirmButtonColor: '#003660'
        });
        return;
      }

      if (
        config.promesa &&
        config.superVerde !== null &&
        config.verde !== null &&
        config.rojo !== null &&
        !(config.superVerde > config.verde && config.verde > config.rojo)
      ) {
        void Swal.fire({
          icon: 'warning',
          title: 'Rangos invalidos',
          text: `En ${config.nombre} debe cumplirse: Super Verde > Verde > Rojo.`,
          confirmButtonColor: '#003660'
        });
        return;
      }
    }

    const payloadBase = {
      primary_promise: this.promesaLider.trim(),
      primary_kpi_type: this.primaryKpiType,
      primary_kpi_type_number: this.primaryKpiTypeNumber,
      primary_kpi_super_green: this.primaryKpiSuperGreen,
      primary_kpi_green: this.primaryKpiGreen,
      primary_kpi_red: this.primaryKpiRed,
      secondary_promise: this.promesa2.trim(),
      secondary_kpi_type: this.secondaryKpiType,
      secondary_kpi_type_number: this.secondaryKpiTypeNumber,
      secondary_kpi_super_green: this.secondaryKpiSuperGreen,
      secondary_kpi_green: this.secondaryKpiGreen,
      secondary_kpi_red: this.secondaryKpiRed,
      tertiary_promise: this.promesa3.trim(),
      tertiary_kpi_type: this.tertiaryKpiType,
      tertiary_kpi_type_number: this.tertiaryKpiTypeNumber,
      tertiary_kpi_super_green: this.tertiaryKpiSuperGreen,
      tertiary_kpi_green: this.tertiaryKpiGreen,
      tertiary_kpi_red: this.tertiaryKpiRed,
      created_by: this.created_by
    };

    const hasAnyPromise =
      this.promesaLider.trim() !== '' ||
      this.promesa2.trim() !== '' ||
      this.promesa3.trim() !== '';

    const hasCentralClient = this.clienteCentral.trim() !== '';

    if (!hasAnyPromise && !hasCentralClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Por favor completa al menos un campo antes de guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    if ((this.id || this.centralClientId) && !this.hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron modificaciones para guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const requests: Promise<any>[] = [];
    let brandIndex = -1;
    let centralIndex = -1;

    if (hasAnyPromise) {
      if (this.id) {
        brandIndex = requests.push(this.opspService.updateBrandPromise(this.id, payloadBase)) - 1;
      } else {
        brandIndex = requests.push(
          this.opspService.createBrandPromise({
            ...payloadBase,
            id_company: this.id_company
          })
        ) - 1;
      }
    }

    if (hasCentralClient) {
      const centralPayload = {
        core_client_summary: this.clienteCentral.trim(),
        created_by: this.created_by
      };

      if (this.centralClientId) {
        centralIndex = requests.push(this.opspService.updateCentralClient(this.centralClientId, centralPayload)) - 1;
      } else {
        centralIndex = requests.push(
          this.opspService.createCentralClient({
            ...centralPayload,
            id_company: this.id_company
          })
        ) - 1;
      }
    }

    Promise.all(requests)
      .then((responses: any[]) => {
        if (!this.id && brandIndex >= 0) {
          const brandResp = responses[brandIndex];
          if (brandResp?.data?.[0]?.id) this.id = brandResp.data[0].id;
        }

        if (!this.centralClientId && centralIndex >= 0) {
          const centralResp = responses[centralIndex];
          if (centralResp?.data?.[0]?.id) this.centralClientId = centralResp.data[0].id;
        }

        this.originalSnapshot = {
          clienteCentral: this.clienteCentral,
          promesaLider: this.promesaLider,
          promesa2: this.promesa2,
          promesa3: this.promesa3,
          primaryKpiType: this.primaryKpiType,
          primaryKpiTypeNumber: this.primaryKpiTypeNumber,
          primaryKpiSuperGreen: this.primaryKpiSuperGreen,
          primaryKpiGreen: this.primaryKpiGreen,
          primaryKpiRed: this.primaryKpiRed,
          secondaryKpiType: this.secondaryKpiType,
          secondaryKpiTypeNumber: this.secondaryKpiTypeNumber,
          secondaryKpiSuperGreen: this.secondaryKpiSuperGreen,
          secondaryKpiGreen: this.secondaryKpiGreen,
          secondaryKpiRed: this.secondaryKpiRed,
          tertiaryKpiType: this.tertiaryKpiType,
          tertiaryKpiTypeNumber: this.tertiaryKpiTypeNumber,
          tertiaryKpiSuperGreen: this.tertiaryKpiSuperGreen,
          tertiaryKpiGreen: this.tertiaryKpiGreen,
          tertiaryKpiRed: this.tertiaryKpiRed
        };

        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'Promesa de Marca y Cliente Central guardados correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch(err => {
        console.error('Error guardando Promesa de Marca / Cliente Central:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la informacion. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }

  private toNullableNumber(value: any): number | null {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}



