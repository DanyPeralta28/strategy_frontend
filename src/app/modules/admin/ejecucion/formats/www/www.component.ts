import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { EjecucionService } from '../../../services/ejecucion.service';

type EstadoWWW = 'En proceso' | 'Ejecutado' | 'Atrasado' | 'Pendiente' | '';

interface WWWRow {
  id?: number;
  que: string;
  quien: string;
  cuando: string;       // ISO yyyy-mm-dd
  estado: EstadoWWW;
  nuevoCuando: string;  // ISO yyyy-mm-dd
}

@Component({
  selector: 'app-www',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './www.component.html',
  styleUrl: './www.component.scss'
})
export class WwwComponent implements OnInit {
  estados: EstadoWWW[] = ['En proceso', 'Ejecutado', 'Atrasado', 'Pendiente', ''];
  estadosFiltro: EstadoWWW[] = ['Atrasado', 'En proceso', 'Ejecutado', 'Pendiente'];
  estadosSeleccionados: EstadoWWW[] = [];
  showEstadosDropdown = false;
  targetOptions: { label: string; value: 'my' | 'led' }[] = [
    { label: 'Mi equipo', value: 'my' },
    { label: 'Equipo que lidero', value: 'led' },
  ];
  targetSeleccionado: 'my' | 'led' = 'my';
  readonly id_company = environment.defaultCompanyId;
  readonly id_entity = environment.defaultEntityId;
  readonly created_by = environment.defaultCreatedBy;
  readonly requester_user_id = String(environment.defaultCreatedBy);

  toggleEstadoFiltro(estado: EstadoWWW) {
    if (this.estadosSeleccionados.includes(estado)) {
      this.estadosSeleccionados = this.estadosSeleccionados.filter(e => e !== estado);
    } else {
      this.estadosSeleccionados = [...this.estadosSeleccionados, estado];
    }

    this.loadWww();
  }

  toggleEstadosDropdown() {
    this.showEstadosDropdown = !this.showEstadosDropdown;
  }
  modoReunion = false;

  filas: WWWRow[] = [
    { que: '', quien: '', cuando: '', estado: '', nuevoCuando: '' }
  ];

  trackByIndex = (_: number, __: WWWRow) => _;

  addRow() {
    this.filas.push({ que: '', quien: '', cuando: '', estado: '', nuevoCuando: '' });
  }

  removeRow(i: number) {
    this.filas.splice(i, 1);
    if (!this.filas.length) this.addRow();
  }

  limpiarVacias() {
    this.filas = this.filas.filter(r =>
      (r.que?.trim() || r.quien?.trim() || r.cuando || r.estado || r.nuevoCuando)
    );
    if (!this.filas.length) this.addRow();
  }

  constructor(private ejecucionService: EjecucionService) {}

  ngOnInit(): void {
    this.loadWww();
  }

  private buildWwwParams() {
    const params: {
      id_company: string;
      requester_user_id: string;
      preset?: string;
      statuses?: string;
      team_scope?: string;
      id_entity?: string;
    } = {
      id_company: this.id_company,
      requester_user_id: this.requester_user_id,
    };

    if (this.id_entity) {
      params.id_entity = this.id_entity;
    }

    if (this.modoReunion) {
      params.preset = 'meeting';
    }

    if (this.estadosSeleccionados.length) {
      params.statuses = this.estadosSeleccionados.join(',');
    }

    if (this.targetSeleccionado) {
      params.team_scope = this.targetSeleccionado;
    }

    return params;
  }

  onModoChange() {
    this.loadWww();
  }

  onTargetChange() {
    this.loadWww();
  }

  private mapFromApi(row: any): WWWRow {
    return {
      id: row?.id,
      que: row?.what ?? '',
      quien: row?.who ?? '',
      cuando: row?.when ?? '',
      estado: (row?.www_status ?? '') as EstadoWWW,
      nuevoCuando: row?.new_when ?? '',
    };
  }

  private async loadWww(): Promise<void> {
    try {
      const resp = await this.ejecucionService.getWwwVisible(this.buildWwwParams());
      const data = Array.isArray(resp?.data) ? resp.data : [];
      if (data.length) {
        this.filas = data.map((row: any) => this.mapFromApi(row));
      } else {
        this.filas = [{ que: '', quien: '', cuando: '', estado: '', nuevoCuando: '' }];
      }
    } catch (error) {
      console.error('Error cargando WWW', error);
      Swal.fire('Error', 'No se pudo cargar WWW. Intenta de nuevo.', 'error');
    }
  }

  async guardar() {
    const payload = this.filas
      .filter(r => !r.id)
      .filter(r => (r.que?.trim() || r.quien?.trim() || r.cuando || r.estado || r.nuevoCuando))
      .map(r => ({
        id_company: this.id_company,
        id_entity: this.id_entity,
        what: r.que?.trim() || '',
        who: r.quien?.trim() || '',
        when: r.cuando || '',
        www_status: r.estado || '',
        new_when: r.nuevoCuando || '',
        status: 1,
        created_by: this.created_by,
      }));

    if (!payload.length) {
      Swal.fire('Sin registros', 'No hay nuevas filas para guardar.', 'info');
      return;
    }

    try {
      await this.ejecucionService.createWww({ items: payload });
      Swal.fire('Guardado', 'Registros actualizados', 'success');
    } catch (error) {
      console.error('Error guardando WWW', error);
      Swal.fire('Error', 'No se pudo guardar WWW.', 'error');
    }
  }

  estadoBadgeClass(estado: EstadoWWW) {
    switch (estado) {
      case 'Ejecutado': return 'bg-emerald-600';
      case 'En proceso': return 'bg-blue-600';
      case 'Atrasado': return 'bg-rose-600';
      case 'Pendiente': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  }

  estadoSelectClass(estado: EstadoWWW) {
    if (!estado) return 'bg-white text-slate-700 border-slate-300';
    return `${this.estadoBadgeClass(estado)} text-white border-transparent`;
  }
}

