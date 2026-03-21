import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';
import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

interface FlywheelItem {
  id?: number;
  uid: string;
  code: number;
  order_item: number;
  descripcion: string;
  kpi: string;
  kpi_type: 'Directo' | 'Inverso' | '';
  kpi_type_number: 'Porcentaje' | 'Entero' | '';
  kpi_super_green: number | null;
  kpi_green: number | null;
  kpi_red: number | null;
  responsable: string;
}

@Component({
  selector: 'app-flywheel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
  templateUrl: './flywheel.component.html',
  styleUrl: './flywheel.component.scss',
})
export class FlywheelComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  viewMode: 'editor' | 'circular' = 'editor';
  readonly kpiTypeOptions: Array<'Directo' | 'Inverso'> = ['Directo', 'Inverso'];
  readonly kpiNumberTypeOptions: Array<'Porcentaje' | 'Entero'> = ['Porcentaje', 'Entero'];

  flywheelItems: FlywheelItem[] = [];
  originalFlywheelItems: FlywheelItem[] = [];
  originalSequence: string[] = [];

  id_company = getSessionCompanyId();
  flywheelCode = 101;
  created_by = getSessionUserId();

  constructor(public opspService: OpspService) {}

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_flywheel');
  }

  exportExcel(): void {
    const rows = this.flywheelItems.map((item) => ({
      Orden: item.order_item,
      Descripcion: item.descripcion.trim(),
      KPI: item.kpi.trim(),
      Tipo: item.kpi_type,
      'Tipo numerico': item.kpi_type_number,
      'Super Verde': item.kpi_super_green ?? '',
      Verde: item.kpi_green ?? '',
      Rojo: item.kpi_red ?? '',
      Responsable: item.responsable.trim(),
    }));

    void exportSheetsToExcel('opsp_flywheel', [
      {
        name: 'Flywheel',
        rows,
        widths: [10, 55, 34, 18, 20, 14, 12, 12, 26],
      },
    ]);
  }

  ngOnInit(): void {
    this.loadFlywheel();
  }

  private makeUid(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private createEmptyItem(orderItem: number): FlywheelItem {
    return {
      uid: this.makeUid(),
      code: this.flywheelCode,
      order_item: orderItem,
      descripcion: '',
      kpi: '',
      kpi_type: '',
      kpi_type_number: '',
      kpi_super_green: null,
      kpi_green: null,
      kpi_red: null,
      responsable: '',
    };
  }

  loadFlywheel(): void {
    this.opspService
      .getFlywheelByCompany(this.id_company)
      .then((resp) => {
        if (!resp?.data || resp.data.length === 0) {
          this.flywheelItems = [this.createEmptyItem(1)];
          this.syncOrderItems();
          this.originalFlywheelItems = this.flywheelItems.map((i) => ({ ...i }));
          this.originalSequence = this.flywheelItems.map((i) => i.uid);
          return;
        }

        const dataArray = resp.data as any[];
        if (dataArray[0]?.code) {
          this.flywheelCode = dataArray[0].code;
        }

        this.flywheelItems = dataArray.map((d, index) => ({
          id: d.id,
          uid: d.id ? `existing-${d.id}` : this.makeUid(),
          code: d.code ?? this.flywheelCode,
          order_item: d.order_item ?? index + 1,
          descripcion: d.title || '',
          kpi: d.kpi_description || '',
          kpi_type: d.kpi_type || '',
          kpi_type_number: d.kpi_type_number || '',
          kpi_super_green: this.toNumberOrNull(d.kpi_super_green),
          kpi_green: this.toNumberOrNull(d.kpi_green),
          kpi_red: this.toNumberOrNull(d.kpi_red),
          responsable: d.kpi_leader || '',
        }));

        this.flywheelItems.sort((a, b) => (a.order_item || 0) - (b.order_item || 0));
        this.originalFlywheelItems = this.flywheelItems.map((i) => ({ ...i }));
        this.originalSequence = this.flywheelItems.map((i) => i.uid);
      })
      .catch((err) => {
        console.error('Error cargando Flywheel:', err);
        this.flywheelItems = [this.createEmptyItem(1)];
        this.syncOrderItems();
        this.originalFlywheelItems = this.flywheelItems.map((i) => ({ ...i }));
        this.originalSequence = this.flywheelItems.map((i) => i.uid);
      });
  }

  agregarItem(): void {
    this.flywheelItems.push(this.createEmptyItem(this.flywheelItems.length + 1));
    this.syncOrderItems();
  }

  eliminarItem(index: number): void {
    this.flywheelItems.splice(index, 1);
    this.syncOrderItems();
  }

  reordenar(event: CdkDragDrop<FlywheelItem[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.flywheelItems, event.previousIndex, event.currentIndex);
    this.syncOrderItems();
  }

  private syncOrderItems(): void {
    this.flywheelItems.forEach((it, idx) => {
      it.order_item = idx + 1;
      it.code = this.flywheelCode;
    });
  }

  private isSameItem(a: FlywheelItem, b: FlywheelItem): boolean {
    return (
      a.code === b.code &&
      a.order_item === b.order_item &&
      a.descripcion === b.descripcion &&
      a.kpi === b.kpi &&
      a.kpi_type === b.kpi_type &&
      a.kpi_type_number === b.kpi_type_number &&
      a.kpi_super_green === b.kpi_super_green &&
      a.kpi_green === b.kpi_green &&
      a.kpi_red === b.kpi_red &&
      a.responsable === b.responsable
    );
  }

  private sequencesEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }

  private buildPayloadForItem(item: FlywheelItem, isCreate: boolean): any {
    const base: any = {
      code: item.code,
      order_item: item.order_item,
      title: item.descripcion,
      kpi_description: item.kpi,
      kpi_type: item.kpi_type,
      kpi_type_number: item.kpi_type_number,
      kpi_super_green: item.kpi_super_green,
      kpi_green: item.kpi_green,
      kpi_red: item.kpi_red,
      kpi_leader: item.responsable,
      created_by: this.created_by,
    };
    if (isCreate) {
      base.id_company = this.id_company;
    }
    return base;
  }

  guardar(): void {
    if (!this.flywheelItems.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Vacio',
        text: 'Agrega al menos un elemento al flywheel.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    const invalidItem = this.flywheelItems.find((item) => !this.isValidItem(item));
    if (invalidItem) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: `Completa todos los campos del KPI en el elemento ${invalidItem.order_item}.`,
        confirmButtonColor: '#003660',
      });
      return;
    }

    const invalidThresholdItem = this.flywheelItems.find((item) => !this.hasValidThresholds(item));
    if (invalidThresholdItem) {
      Swal.fire({
        icon: 'warning',
        title: 'Valores invalidos',
        text: `En el elemento ${invalidThresholdItem.order_item}, Super Verde debe ser mayor a Verde y Verde mayor a Rojo.`,
        confirmButtonColor: '#003660',
      });
      return;
    }

    const currentSequence = this.flywheelItems.map((i) => i.uid);
    const sequenceChanged = !this.sequencesEqual(this.originalSequence, currentSequence);
    const promises: Promise<any>[] = [];

    this.flywheelItems.forEach((item) => {
      if (item.id) {
        const original = this.originalFlywheelItems.find((o) => o.id === item.id);
        const itemChanged = !original || !this.isSameItem(original, item);
        if (itemChanged || sequenceChanged) {
          const payload = this.buildPayloadForItem(item, false);
          promises.push(
            this.opspService.updateFlywheel(item.id, payload).then((res) => {
              if (original) {
                Object.assign(original, { ...item });
              }
              return res;
            })
          );
        }
      } else {
        const payload = this.buildPayloadForItem(item, true);
        promises.push(
          this.opspService.createFlywheel(payload).then((res) => {
            if (res?.data && res.data[0]?.id) {
              item.id = res.data[0].id;
              this.originalFlywheelItems.push({ ...item });
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
        confirmButtonColor: '#003660',
      });
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    Promise.allSettled(promises).then((results) => {
      const errors = results.filter((r) => r.status !== 'fulfilled').length;

      if (sequenceChanged) {
        this.originalSequence = this.flywheelItems.map((i) => i.uid);
      }

      Swal.fire({
        icon: errors ? 'warning' : 'success',
        title: errors ? 'Resultado mixto' : 'Flywheel guardado',
        text: errors ? 'Algunos elementos no se pudieron guardar.' : '',
        confirmButtonColor: '#003660',
      });
    });
  }

  trackByItem(_index: number, item: FlywheelItem): any {
    return item.uid;
  }

  private isValidItem(item: FlywheelItem): boolean {
    return !!item.descripcion.trim()
      && !!item.kpi.trim()
      && !!item.kpi_type
      && !!item.kpi_type_number
      && item.kpi_super_green != null
      && item.kpi_green != null
      && item.kpi_red != null
      && !!item.responsable.trim();
  }

  private hasValidThresholds(item: FlywheelItem): boolean {
    if (item.kpi_super_green == null || item.kpi_green == null || item.kpi_red == null) {
      return false;
    }
    return item.kpi_super_green > item.kpi_green && item.kpi_green > item.kpi_red;
  }

  private toNumberOrNull(value: any): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private get angleStep(): number {
    return (2 * Math.PI) / this.flywheelItems.length;
  }

  getPoint(index: number, radius = 220): { x: number; y: number } {
    const angle = index * this.angleStep - Math.PI / 2;
    return {
      x: 300 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle),
    };
  }

  getBlockStyle(index: number): any {
    const { x, y } = this.getPoint(index);
    return {
      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
    };
  }
}
