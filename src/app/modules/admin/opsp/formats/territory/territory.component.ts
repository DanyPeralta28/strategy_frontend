import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

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

@Component({
  selector: 'app-territory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './territory.component.html',
})
export class TerritoryComponent implements OnInit {
  newTerritory = '';
  territories: Territory[] = [];
  territoryId: number | null = null;

  // Estos deberían venir del contexto real (por ahora hardcodeados)
  id_company = 'BANRURAL_GT2';
  created_by = 'admin_user';

  constructor(private opspService: OpspService) { }

  ngOnInit(): void {
    this.loadTerritories();
  }

  async loadTerritories(): Promise<void> {
    try {
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
