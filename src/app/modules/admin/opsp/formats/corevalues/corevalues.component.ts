import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

interface CoreValueItem {
  id?: number;
  uid: string;
  value_title: string;
  short_description: string;
  long_description: string;
  // metadata que vino originalmente (para snapshot)
}

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
  selector: 'app-corevalues',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
  templateUrl: './corevalues.component.html',
  styleUrl: './corevalues.component.scss'
})
export class CorevaluesComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  coreValues: CoreValueItem[] = [];
  originalCoreValues: CoreValueItem[] = [];

  // contexto fijo por ahora; puedes inyectar / obtener de ruta
  id_company = getSessionCompanyId();
  created_by = getSessionUserId();

  constructor(public opspService: OpspService) { }

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_corevalues');
  }

  exportExcel(): void {
    const rows = this.coreValues
      .map((item, index) => ({
        Numero: index + 1,
        ValorCentral: item.value_title.trim(),
        DescripcionCorta: item.short_description.trim(),
        DescripcionLarga: item.long_description.trim(),
      }));

    void exportSheetsToExcel('opsp_corevalues', [
      {
        name: 'Valores Centrales',
        rows,
        widths: [10, 32, 50, 80],
      },
    ]);
  }

  ngOnInit(): void {
    this.loadCoreValues();
  }

  private makeUid(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /** Carga desde API */
  loadCoreValues(): void {
    // Asegúrate de tener este método en el service: getCoreValueByCompany
    this.opspService
      .getCoreValuesByCompany(this.id_company)
      .then(resp => {
        const dataArray = resp?.data || [];
        if (!dataArray.length) {
          // inicializar con uno vacío
          this.coreValues = [
            {
              uid: this.makeUid(),
              value_title: '',
              short_description: '',
              long_description: ''
            }
          ];
          this.originalCoreValues = this.coreValues.map(v => ({ ...v }));
          return;
        }

        // mapear respuestas
        this.coreValues = dataArray.map((d: any) => ({
          id: d.id,
          uid: d.id ? `existing-${d.id}` : this.makeUid(),
          value_title: d.value_title || '',
          short_description: d.short_description || '',
          long_description: d.long_description || ''
        }));

        this.originalCoreValues = this.coreValues.map(v => ({ ...v }));
      })
      .catch(err => {
        console.error('Error cargando Valores Centrales:', err);
        // fallback con uno vacío
        this.coreValues = [
          {
            uid: this.makeUid(),
            value_title: '',
            short_description: '',
            long_description: ''
          }
        ];
        this.originalCoreValues = this.coreValues.map(v => ({ ...v }));
      });
  }

  agregarValor(): void {
    this.coreValues.push({
      uid: this.makeUid(),
      value_title: '',
      short_description: '',
      long_description: ''
    });
  }

  eliminarValor(index: number): void {
    this.coreValues.splice(index, 1);
  }

  private isSameValue(a: CoreValueItem, b: CoreValueItem): boolean {
    return (
      a.value_title === b.value_title &&
      a.short_description === b.short_description &&
      a.long_description === b.long_description
    );
  }

  trackByValor(_index: number, item: CoreValueItem): any {
    return item.uid;
  }

  /** Guardado con create / update / delete */
  guardarValores(): void {
    // filtrar vacíos (todos los campos vacíos)
    const valoresFiltrados = this.coreValues.filter(v =>
      v.value_title.trim() !== '' ||
      v.short_description.trim() !== '' ||
      v.long_description.trim() !== ''
    );

    // preparar operaciones
    const promises: Promise<any>[] = [];

    // 1. detectar eliminados: originales con id que ya no están
    const originalesConId = this.originalCoreValues.filter(o => o.id);
    originalesConId.forEach(original => {
      const sigueExistiendo = this.coreValues.some(cv => cv.id === original.id);
      if (!sigueExistiendo && original.id) {
        // fue eliminado en UI: eliminar en backend
        promises.push(this.opspService.deleteCoreValue(original.id));
      }
    });

    // 2. crear / actualizar actuales
    valoresFiltrados.forEach(item => {
      if (item.id) {
        // existe: ver si cambió
        const original = this.originalCoreValues.find(o => o.id === item.id);
        if (!original || !this.isSameValue(original, item)) {
          const payload = {
            value_title: item.value_title,
            short_description: item.short_description,
            long_description: item.long_description,
            created_by: this.created_by
          };
          promises.push(
            this.opspService.updateCoreValue(item.id, payload).then(res => {
              if (original) Object.assign(original, { ...item });
              return res;
            })
          );
        }
      } else {
        // nuevo
        const payload = {
          id_company: this.id_company,
          value_title: item.value_title,
          short_description: item.short_description,
          long_description: item.long_description,
          created_by: this.created_by
        };
        promises.push(
          this.opspService.createCoreValue(payload).then(res => {
            // si viene id, asignarlo
            if (res?.data && res.data[0]?.id) {
              item.id = res.data[0].id;
              this.originalCoreValues.push({ ...item });
            }
            return res;
          })
        );
      }
    });

    if (promises.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron cambios para guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    Promise.allSettled(promises).then(results => {
      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      let title = '¡Guardado!';
      let icon: any = 'success';
      if (failures && successes) {
        title = 'Resultado mixto';
        icon = 'warning';
      } else if (failures && !successes) {
        title = 'Error';
        icon = 'error';
      }

      Swal.fire({
        icon,
        title,
        text: 'Los valores han sido guardados con exito.',
        confirmButtonColor: '#003660'
      });

      // refrescar snapshot si al menos hubo éxito
      if (successes) {
        this.originalCoreValues = this.coreValues.map(v => ({ ...v }));
      }
    });
  }
}







