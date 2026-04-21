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

interface Channel {
  name: string;
}

interface Product {
  name: string;
  channels: Channel[];
}

interface Segment {
  name: string;
  products: Product[];
}

interface Territory {
  name: string;
  segments: Segment[];
}

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
  selector: 'app-territory',
  standalone: true,
  imports: [CommonModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective, OpspEntityFilterComponent],
  templateUrl: './territory.component.html',
})
export class TerritoryComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  newTerritory = '';
  territories: Territory[] = [];
  territoryId: number | null = null;

  // Estos deberían venir del contexto real (por ahora hardcodeados)
  id_company = getSessionCompanyId();
  created_by = getSessionUserId();

  constructor(
    private opspService: OpspService,
    private opspEntityContextService: OpspEntityContextService
  ) { }

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_territory');
  }

  exportExcel(): void {
    const rows = this.territories.flatMap((territory) => {
      if (!territory.segments.length) {
        return [{
          Territorio: territory.name,
          Segmento: '',
          Producto: '',
          Canal: '',
        }];
      }

      return territory.segments.flatMap((segment) => {
        if (!segment.products.length) {
          return [{
            Territorio: territory.name,
            Segmento: segment.name,
            Producto: '',
            Canal: '',
          }];
        }

        return segment.products.flatMap((product) => {
          if (!product.channels.length) {
            return [{
              Territorio: territory.name,
              Segmento: segment.name,
              Producto: product.name,
              Canal: '',
            }];
          }

          return product.channels.map((channel) => ({
            Territorio: territory.name,
            Segmento: segment.name,
            Producto: product.name,
            Canal: channel.name,
          }));
        });
      });
    });

    void exportSheetsToExcel('opsp_territory', [
      {
        name: 'Territorios',
        rows,
        widths: [28, 28, 28, 28],
      },
    ]);
  }

  ngOnInit(): void {
    this.loadTerritories();
    this.opspEntityContextService.entityChanges$.subscribe(() => this.loadTerritories());
  }

  async loadTerritories(): Promise<void> {
    try {
      this.territories = [];
      this.territoryId = null;
      const resp = await this.opspService.getTerritoriesByCompany(this.id_company);
      if (resp?.data && Array.isArray(resp.data) && resp.data.length) {
        const found = resp.data[0];
        this.territoryId = found.id;
        this.territories = JSON.parse(JSON.stringify(found.geographic_location || []));
      } else {
        this.territories = [];
        this.territoryId = null;
      }
    } catch (err) {
      console.error('Error cargando territorios:', err);
    }
  }

  addTerritory() {
    const name = this.newTerritory.trim();
    if (name) {
      this.territories.push({ name, segments: [] });
      this.newTerritory = '';
    }
  }

  removeTerritory(index: number) {
    this.territories.splice(index, 1);
  }

  addSegment(t: Territory) {
    t.segments.push({ name: '', products: [] });
  }

  removeSegment(t: Territory, sIndex: number) {
    t.segments.splice(sIndex, 1);
  }

  addProduct(s: Segment) {
    s.products.push({ name: '', channels: [] });
  }

  removeProduct(s: Segment, pIndex: number) {
    s.products.splice(pIndex, 1);
  }

  addChannel(p: Product) {
    p.channels.push({ name: '' });
  }

  removeChannel(p: Product, cIndex: number) {
    p.channels.splice(cIndex, 1);
  }

  async saveAll() {
    // opcional: podrías filtrar territorios vacíos aquí si hace falta
    const geographic_location = this.territories;

    // construir el payload
    const payload: any = {
      geographic_location,
      created_by: this.created_by,
    };

    try {
      if (this.territoryId) {
        // update (no incluir id_company ni status)
        await this.opspService.updateTerritory(this.territoryId, payload);
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Los territorios se han actualizado correctamente.',
          confirmButtonColor: '#003660',
        });
      } else {
        // create: sí incluir id_company
        payload.id_company = this.id_company;
        const resp = await this.opspService.createTerritory(payload);
        if (resp?.data && Array.isArray(resp.data) && resp.data[0]?.id) {
          this.territoryId = resp.data[0].id;
        }
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'Los territorios se han guardado correctamente.',
          confirmButtonColor: '#003660',
        });
      }
    } catch (error) {
      console.error('Error guardando territorios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la información. Intenta nuevamente.',
        confirmButtonColor: '#D32F2F',
      });
    }
  }
}





