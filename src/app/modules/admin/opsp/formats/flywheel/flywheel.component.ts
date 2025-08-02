import { Component, OnInit } from '@angular/core';
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

interface FlywheelItem {
  id?: number;
  uid: string;
  code: number;
  order_item: number;
  descripcion: string;
  kpi: string;
  responsable: string;
}

@Component({
  selector: 'app-flywheel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule],
  templateUrl: './flywheel.component.html',
  styleUrl: './flywheel.component.scss',
})
export class FlywheelComponent implements OnInit {
  viewMode: 'editor' | 'circular' = 'editor';

  flywheelItems: FlywheelItem[] = [];
  originalFlywheelItems: FlywheelItem[] = [];
  originalSequence: string[] = [];

  // contexto / estado
  id_company: string = 'BANRURAL_GT98'; // ajustar según contexto real
  flywheelCode: number = 101; // default, puede venir desde backend
  created_by: string = 'admin_user';

  constructor(public opspService: OpspService) { }

  ngOnInit(): void {
    this.loadFlywheel();
  }

  private makeUid(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /** Carga existente desde API */
  loadFlywheel(): void {
    this.opspService
      .getFlywheelByCompany(this.id_company)
      .then(resp => {
        if (!resp?.data || resp.data.length === 0) {
          // inicializar con un solo ítem vacío (antes eran tres)
          this.flywheelItems = [
            {
              uid: this.makeUid(),
              code: this.flywheelCode,
              order_item: 1,
              descripcion: '',
              kpi: '',
              responsable: '',
            },
          ];
          this.syncOrderItems();
          this.originalFlywheelItems = this.flywheelItems.map(i => ({ ...i }));
          this.originalSequence = this.flywheelItems.map(i => i.uid);
          return;
        }

        const dataArray = resp.data as any[];
        if (dataArray[0]?.code) {
          this.flywheelCode = dataArray[0].code;
        }

        // mapear items, asegurando uid
        this.flywheelItems = dataArray.map(d => ({
          id: d.id,
          uid: d.id ? `existing-${d.id}` : this.makeUid(),
          code: d.code,
          order_item: d.order_item,
          descripcion: d.title || '',
          kpi: d.kpi_description || '',
          responsable: d.kpi_leader || '',
        }));

        // ordenar según order_item antes de usar
        this.flywheelItems.sort((a, b) => (a.order_item || 0) - (b.order_item || 0));

        // snapshot original y secuencia
        this.originalFlywheelItems = this.flywheelItems.map(i => ({ ...i }));
        this.originalSequence = this.flywheelItems.map(i => i.uid);
      })
      .catch(err => {
        console.error('Error cargando Flywheel:', err);
        // fallback de inicialización con un solo ítem vacío
        this.flywheelItems = [
          {
            uid: this.makeUid(),
            code: this.flywheelCode,
            order_item: 1,
            descripcion: '',
            kpi: '',
            responsable: '',
          },
        ];
        this.syncOrderItems();
        this.originalFlywheelItems = this.flywheelItems.map(i => ({ ...i }));
        this.originalSequence = this.flywheelItems.map(i => i.uid);
      });
  }

  /** Añadir / eliminar / reordenar */
  agregarItem(): void {
    this.flywheelItems.push({
      uid: this.makeUid(),
      code: this.flywheelCode,
      order_item: this.flywheelItems.length + 1,
      descripcion: '',
      kpi: '',
      responsable: '',
    });
    this.syncOrderItems();
  }

  eliminarItem(index: number): void {
    this.flywheelItems.splice(index, 1);
    this.syncOrderItems();
  }

  reordenar(event: CdkDragDrop<FlywheelItem[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    console.log('Antes orden:', this.flywheelItems.map(i => i.uid));
    moveItemInArray(this.flywheelItems, event.previousIndex, event.currentIndex);
    this.syncOrderItems();
    console.log('Después orden:', this.flywheelItems.map(i => i.uid));
  }

  /** Sincroniza order_item con posición visual y asegura code */
  private syncOrderItems(): void {
    this.flywheelItems.forEach((it, idx) => {
      it.order_item = idx + 1;
      it.code = this.flywheelCode;
    });
  }

  /** Comparadores */
  private isSameItem(a: FlywheelItem, b: FlywheelItem): boolean {
    return (
      a.code === b.code &&
      a.order_item === b.order_item &&
      a.descripcion === b.descripcion &&
      a.kpi === b.kpi &&
      a.responsable === b.responsable
    );
  }

  private sequencesEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }

  /** Construye payload por item */
  private buildPayloadForItem(item: FlywheelItem, isCreate: boolean): any {
    const base: any = {
      code: item.code,
      order_item: item.order_item,
      title: item.descripcion,
      kpi_description: item.kpi,
      kpi_leader: item.responsable,
      created_by: this.created_by,
    };
    if (isCreate) {
      base.id_company = this.id_company;
    }
    return base;
  }

  /** Guardar (create/update con detección de reorder) */
  guardar(): void {
    if (!this.flywheelItems.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Vacío',
        text: 'Agrega al menos un elemento al flywheel.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    const currentSequence = this.flywheelItems.map(i => i.uid);
    const sequenceChanged = !this.sequencesEqual(this.originalSequence, currentSequence);

    const promises: Promise<any>[] = [];

    this.flywheelItems.forEach(item => {
      if (item.id) {
        const original = this.originalFlywheelItems.find(o => o.id === item.id);
        const itemChanged = !original || !this.isSameItem(original, item);
        if (itemChanged || sequenceChanged) {
          const payload = this.buildPayloadForItem(item, false);
          promises.push(
            this.opspService.updateFlywheel(item.id!, payload).then(res => {
              if (original) {
                Object.assign(original, { ...item });
              }
              return res;
            })
          );
        }
      } else {
        // nuevo siempre crear
        const payload = this.buildPayloadForItem(item, true);
        promises.push(
          this.opspService.createFlywheel(payload).then(res => {
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
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    Promise.allSettled(promises).then(results => {
      const success: string[] = [];
      const errors: string[] = [];

      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          success.push(`Elemento ${idx + 1} guardado`);
        } else {
          console.error('Error en ítem flywheel:', r.reason);
          errors.push(`Elemento ${idx + 1} falló`);
        }
      });

      if (sequenceChanged) {
        this.originalSequence = this.flywheelItems.map(i => i.uid);
      }

      const title = errors.length ? 'Resultado mixto' : '¡Guardado!';
      const textParts = [...success, ...errors].filter(Boolean).join('. ');

      Swal.fire({
        icon: errors.length ? 'warning' : 'success',
        title,
        text: textParts,
        confirmButtonColor: '#003660',
      });
    });
  }

  /** trackBy para ngFor */
  trackByItem(_index: number, item: FlywheelItem): any {
    return item.uid;
  }

  /* ------------ helpers para vista circular ------------- */
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
