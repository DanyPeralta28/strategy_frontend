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
  selector: 'app-central-client',
  standalone: true,
  imports: [CommonModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective, OpspEntityFilterComponent],
  templateUrl: './centralclient.component.html',
  styleUrl: './centralclient.component.scss'
})
export class CentralClientComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  id_company = getSessionCompanyId();
  created_by = getSessionUserId();

  centralClientId?: number;
  descripcionResumen = '';

  centralClients: any[] = [];
  currentSlideIndex = 0;
  creatingNew = false;

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_centralclient');
  }

  exportExcel(): void {
    const records = this.getExportCentralClients();
    const summaryRows = records.map((record, index) => ({
      Numero: index + 1,
      Id: record.id ?? '',
      Resumen: (record.core_client_summary || '').toString().trim(),
    }));

    const detailRows = records.flatMap((record, index) =>
      this.preguntas.map((pregunta) => ({
        Cliente: index + 1,
        Pregunta: pregunta.pregunta,
        Respuesta: (record[pregunta.key] || '').toString().trim(),
      }))
    );

    void exportSheetsToExcel('opsp_centralclient', [
      {
        name: 'Resumen',
        rows: summaryRows,
        widths: [10, 12, 90],
      },
      {
        name: 'Detalle',
        rows: detailRows,
        widths: [10, 48, 90],
      },
    ]);
  }

  private originalSnapshot: Record<string, string> = {};

  preguntas: Array<{ key: string; pregunta: string; respuesta: string }> = [
    { key: 'age_gender_education', pregunta: 'Edad, genero y educacion', respuesta: '' },
    { key: 'appearance_description', pregunta: 'Apariencia', respuesta: '' },
    { key: 'typical_day_description', pregunta: 'Dia tipico', respuesta: '' },
    { key: 'fears_or_concerns', pregunta: 'Miedos o preocupaciones', respuesta: '' },
    { key: 'client_goals', pregunta: 'Metas del cliente', respuesta: '' },
    { key: 'client_challenges', pregunta: 'Retos del cliente', respuesta: '' },
    { key: 'life_priorities', pregunta: 'Prioridades de vida', respuesta: '' },
    { key: 'motivations_or_rewards', pregunta: 'Motivaciones o recompensas', respuesta: '' },
    { key: 'feelings_of_attractiveness', pregunta: 'Sentirse atractivo cuando...', respuesta: '' },
    { key: 'feelings_of_discomfort', pregunta: 'Sensacion de incomodidad', respuesta: '' },
    { key: 'success_metrics', pregunta: 'Metricas de exito', respuesta: '' },
    { key: 'key_needs_from_us', pregunta: 'Necesidades clave de nosotros', respuesta: '' },
  ];

  constructor(
    public opspService: OpspService,
    private opspEntityContextService: OpspEntityContextService
  ) {}

  ngOnInit(): void {
    this.loadCentralClients();
    this.opspEntityContextService.entityChanges$.subscribe(() => this.loadCentralClients());
  }

  get totalSlides(): number {
    return this.centralClients.length + (this.creatingNew ? 1 : 0);
  }

  get canGoPrev(): boolean {
    return this.currentSlideIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentSlideIndex < this.totalSlides - 1;
  }

  prevSlide(): void {
    if (!this.canGoPrev) return;
    this.currentSlideIndex--;
    this.loadSlideByIndex();
  }

  nextSlide(): void {
    if (!this.canGoNext) return;
    this.currentSlideIndex++;
    this.loadSlideByIndex();
  }

  addNewCentralClient(): void {
    this.creatingNew = true;
    this.currentSlideIndex = this.totalSlides - 1;
    this.centralClientId = undefined;
    this.resetForm();
    this.originalSnapshot = this.buildSnapshot();
  }

  private resetForm(): void {
    this.preguntas.forEach(p => (p.respuesta = ''));
    this.descripcionResumen = '';
  }

  private buildSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    this.preguntas.forEach(p => {
      snapshot[p.key] = (p.respuesta || '').trim();
    });
    snapshot['core_client_summary'] = (this.descripcionResumen || '').trim();
    return snapshot;
  }

  private hasChanges(): boolean {
    const current = this.buildSnapshot();
    for (const key of Object.keys(current)) {
      if (current[key] !== (this.originalSnapshot[key] || '')) {
        return true;
      }
    }
    return false;
  }

  private hasAllFieldsCompleted(): boolean {
    return this.preguntas.every((p) => p.respuesta.trim() !== '')
      && this.descripcionResumen.trim() !== '';
  }

  private applyRecord(existing: any): void {
    this.centralClientId = existing?.id;

    this.preguntas.forEach(p => {
      p.respuesta = existing?.[p.key] || '';
    });

    this.descripcionResumen = existing?.core_client_summary || '';
    this.originalSnapshot = this.buildSnapshot();
  }

  getExportCentralClients(): any[] {
    const currentRecord = {
      id: this.centralClientId ?? '',
      core_client_summary: this.descripcionResumen,
      ...Object.fromEntries(this.preguntas.map((pregunta) => [pregunta.key, pregunta.respuesta])),
    };

    if (this.creatingNew) {
      return [...this.centralClients, currentRecord];
    }

    if (this.centralClientId != null) {
      return this.centralClients.map((record) =>
        Number(record?.id) === Number(this.centralClientId) ? { ...record, ...currentRecord } : record
      );
    }

    return this.centralClients.length ? this.centralClients : [currentRecord];
  }

  private loadSlideByIndex(): void {
    if (this.creatingNew && this.currentSlideIndex === this.totalSlides - 1) {
      this.centralClientId = undefined;
      this.resetForm();
      this.originalSnapshot = this.buildSnapshot();
      return;
    }

    const record = this.centralClients[this.currentSlideIndex];
    if (record) this.applyRecord(record);
  }

  private async loadCentralClients(selectId?: number): Promise<void> {
    try {
      const resp = await this.opspService.getCentralClientByCompany(this.id_company);
      this.centralClients = Array.isArray(resp?.data) ? resp.data : [];

      this.creatingNew = false;

      if (!this.centralClients.length) {
        this.currentSlideIndex = 0;
        this.centralClientId = undefined;
        this.resetForm();
        this.originalSnapshot = this.buildSnapshot();
        return;
      }

      if (selectId != null) {
        const idx = this.centralClients.findIndex(x => Number(x?.id) === Number(selectId));
        this.currentSlideIndex = idx >= 0 ? idx : 0;
      } else if (this.currentSlideIndex >= this.centralClients.length) {
        this.currentSlideIndex = this.centralClients.length - 1;
      }

      this.applyRecord(this.centralClients[this.currentSlideIndex]);
    } catch (err) {
      console.error('Error cargando Cliente Central:', err);
    }
  }

  async save(): Promise<void> {
    const anyFieldFilled =
      this.preguntas.some(p => p.respuesta.trim() !== '') || this.descripcionResumen.trim() !== '';

    if (!anyFieldFilled) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Por favor completa al menos un campo antes de guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    if (!this.centralClientId && !this.hasAllFieldsCompleted()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Para crear un nuevo cliente central debes completar todos los campos.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    if (this.centralClientId && !this.hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron modificaciones para guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const payload: any = {};
    this.preguntas.forEach(p => {
      payload[p.key] = p.respuesta.trim();
    });
    payload.core_client_summary = this.descripcionResumen.trim();
    payload.created_by = this.created_by;

    try {
      if (this.centralClientId) {
        await this.opspService.updateCentralClient(this.centralClientId, payload);
      } else {
        payload.id_company = this.id_company;
        const resp = await this.opspService.createCentralClient(payload);
        const newId = resp?.data?.[0]?.id ?? resp?.data?.id;
        if (newId != null) {
          await this.loadCentralClients(Number(newId));
        } else {
          await this.loadCentralClients();
        }
      }

      if (this.centralClientId) {
        await this.loadCentralClients(this.centralClientId);
      }

      Swal.fire({
        icon: 'success',
        title: this.centralClientId ? 'Actualizado' : 'Creado',
        text: 'La informacion de Cliente Central se ha guardado correctamente.',
        confirmButtonColor: '#003660'
      });
    } catch (err) {
      console.error('Error guardando Cliente Central:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar. Intenta nuevamente.',
        confirmButtonColor: '#D32F2F'
      });
    }
  }
}



