import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service'
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
  selector: 'app-bhag',
  imports: [CommonModule, RouterModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
  templateUrl: './bhag.component.html',
  styleUrl: './bhag.component.scss'
})
export class BhagComponent {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  form = {
    description: '',
    id: '',
    created_by: getSessionUserId()
  };
  id_company = getSessionCompanyId();

  constructor(public opspService: OpspService) { }

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_bhag');
  }

  exportExcel(): void {
    void exportSheetsToExcel('opsp_bhag', [
      {
        name: 'BHAG',
        rows: [
          {
            Campo: 'BHAG',
            Valor: this.form.description.trim(),
          },
        ],
        widths: [24, 90],
      },
    ]);
  }

  ngOnInit() {
    this.loadBhag();
  }

  loadBhag() {
    this.opspService
      .getBhagByCompany(this.id_company)
      .then(bhag => {
        this.form.description = bhag.data[0].description;
        this.form.id = bhag.data[0].id;
        console.log("BHAG recibido:", bhag.data);
      })
      .catch(err => {
        console.error("Error cargando BHAG:", err);
      });
  }

  save(): void {
    const { id, description, created_by } = this.form;
    let obj = {
      id_company: this.id_company,
      description,
      created_by
    }

    if (!description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa el BHAG® y su descripción.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    // Prepara la promesa según si es creación o edición:
    let promise: Promise<any>;
    if (id) {
      promise = this.opspService.updateBhag(id, { description, created_by });
    } else {
      promise = this.opspService.createBhag(obj);
    }

    console.log('BHAG® guardado:', this.form);

    promise
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: id ? '¡Actualizado!' : '¡Creado!',
          text: 'Los datos se han guardado correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch(error => {
        console.error('Error guardando BHAG®:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el BHAG®. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }
}




