import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashService } from '../../../services/cash.service'; // <-- ajusta la ruta
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';

interface Period {
  year: string;
  revenue: number | null;
  cogs: number | null;
  grossMargin: number | null;
  directLabor: number | null;
}

interface ImpactItem {
  label: string;
  rank: number | null;
  index: number;
}

@Component({
  selector: 'app-iel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iel.component.html',
  styleUrls: ['./iel.component.scss']
})
export class IelComponent implements OnInit {
  // ====== Config del contexto (ajusta según tu app) ======
  id_company = environment.defaultCompanyId;
  created_by = environment.defaultCreatedBy;

  // ====== Estado UI ======
  periods: Period[] = [
    { year: '', revenue: null, cogs: null, grossMargin: null, directLabor: null }
  ];

  impactItems: ImpactItem[] = [
    {
      label: 'Incremento (%) de integrantes tipo “A” (del Equipo con Talento)',
      rank: null,
      index: 0
    },
    {
      label: 'Fortalecer las disciplinas de Ejecución (Prioridades, Métricas, Comunicación)',
      rank: null,
      index: 1
    },
    {
      label: 'Optimizar el Desempeño del Producto (Perfeccionar la Promesa de Marca / Indicadores clave de rendimiento)',
      rank: null,
      index: 2
    }
  ];

  // Si existe un registro previo, guardamos su id para hacer PUT
  private existingIelId: number | null = null;
  loading = false;

  constructor(private cashService: CashService) { }

  async ngOnInit(): Promise<void> {
    await this.loadIel();
  }

  // ====== Carga inicial (GET por company) ======
  private async loadIel(): Promise<void> {
    this.loading = true;
    try {
      const resp = await this.cashService.getAllIelByCompany(this.id_company);
      const row = resp?.data?.[0];
      if (!row) return;

      // Guardamos el id para saber que debemos hacer PUT
      this.existingIelId = row.id;

      // Mapeo de DTO → UI
      this.periods = (row.periods_list || []).map((p: any) => ({
        year: String(p.year ?? ''),
        revenue: numOrNull(p.revenue),
        cogs: numOrNull(p.cogs),
        grossMargin: numOrNull(p.grossMargin),
        directLabor: numOrNull(p.directLabor),
      }));

      // Asegura al menos 1 período para la UI
      if (!this.periods.length) {
        this.periods = [{ year: '', revenue: null, cogs: null, grossMargin: null, directLabor: null }];
      }

      // Rellena ranks en los 3 ítems respetando el índice
      const mapByIndex = new Map<number, number>();
      (row.impact_items_list || []).forEach((it: any) => {
        if (typeof it.index === 'number') mapByIndex.set(it.index, Number(it.rank));
      });
      this.impactItems = this.impactItems.map(it => ({
        ...it,
        rank: mapByIndex.has(it.index) ? Number(mapByIndex.get(it.index)) : it.rank
      }));

    } catch (err) {
      console.error('Error cargando IEL:', err);
    } finally {
      this.loading = false;
    }
  }

  // ====== UI helpers ======
  addPeriod(): void {
    this.periods.push({ year: '', revenue: null, cogs: null, grossMargin: null, directLabor: null });
  }

  removePeriod(i: number): void {
    if (this.periods.length > 1) {
      this.periods.splice(i, 1);
    }
  }

  getIel(period: Period): number {
    if (period.grossMargin != null && period.directLabor != null && period.directLabor !== 0) {
      return period.grossMargin / period.directLabor;
    }
    return 0;
  }

  // ====== Guardar (POST o PUT según corresponda) ======
  async save(): Promise<void> {
    // validar impacto
    const ranks = this.impactItems.map(it => it.rank);
    const validSet = new Set(ranks);

    const isValid =
      ranks.length === 3 &&
      validSet.size === 3 &&
      [1, 2, 3].every(v => validSet.has(v));

    if (!isValid) {
      await Swal.fire({
        icon: 'error',
        title: 'Ranking inválido',
        text: 'Debes asignar los valores 1, 2 y 3 sin repetirlos en el Ranking de Impacto.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    // Limpieza rápida de NaN → null
    const cleanPeriods = this.periods.map(p => ({
      year: String(p.year || ''),
      revenue: numOrNull(p.revenue),
      cogs: numOrNull(p.cogs),
      grossMargin: numOrNull(p.grossMargin),
      directLabor: numOrNull(p.directLabor),
    }));

    // Armado de DTO según método
    const createDto = {
      id_company: this.id_company,
      periods_list: cleanPeriods,
      impact_items_list: this.impactItems.map(it => ({
        rank: numOrNull(it.rank),
        index: it.index
      })),
      status: 1,
      created_by: this.created_by
    };

    const updateDto = {
      periods_list: cleanPeriods,
      impact_items_list: this.impactItems.map(it => ({
        rank: numOrNull(it.rank),
        index: it.index
      })),
      status: 1,
      created_by: this.created_by
    };

    this.loading = true;
    try {
      if (this.existingIelId != null) {
        // PUT /cash-format-iel/:id
        await this.cashService.updateIel(this.existingIelId, updateDto);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El formato IEL se actualizó correctamente.',
          confirmButtonColor: '#003660'
        });
      } else {
        // POST /cash-format-iel
        const res = await this.cashService.createIel(createDto);
        const newId = res?.data?.id ?? res?.id;
        if (newId != null) this.existingIelId = Number(newId);

        await Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'El formato IEL se guardó correctamente.',
          confirmButtonColor: '#003660'
        });
      }

      console.log('IEL guardado correctamente');
    } catch (err) {
      console.error('Error guardando IEL:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el formato IEL. Inténtalo de nuevo.',
        confirmButtonColor: '#003660'
      });
    } finally {
      this.loading = false;
    }
  }
}

// ====== Helpers ======
function numOrNull(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}



