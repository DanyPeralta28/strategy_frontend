import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CashService } from '../../../services/cash.service'; // ajusta la ruta

interface ValueArea {
  label: string;
  rating: 'Ninguno' | 'Débil' | 'Sólido' | 'Excepcional' | null;
}

interface Priority {
  name: string;
  create: string;
  improve: string;
}

@Component({
  selector: 'app-value',
  imports: [CommonModule, FormsModule],
  templateUrl: './value.component.html',
  styleUrl: './value.component.scss'
})
export class ValueComponent implements OnInit {
  // contexto (ajusta según tu app)
  id_company = 'BANRURAL_GT99';
  created_by = 'admin_user';

  areas: ValueArea[] = [
    { label: 'Contratos a Largo plazo', rating: null },
    { label: 'Suscripciones Inscripciones auto renovables', rating: null },
    { label: 'Suscripciones como Inversiones en aumento de Capital', rating: null },
    { label: 'Suscripciones', rating: null },
    { label: 'Inversiones de Capital para consumibles', rating: null },
    { label: 'Consumibles', rating: null }
  ];

  priorities: Priority[] = [{ name: '', create: '', improve: '' }];

  private existingValueId: number | null = null;
  loading = false;

  constructor(private cashService: CashService) {}

  async ngOnInit(): Promise<void> {
    await this.loadValue();
  }

  private async loadValue(): Promise<void> {
    this.loading = true;
    try {
      const resp = await this.cashService.getAllValueByCompany(this.id_company);
      const row = resp?.data?.[0];
      if (!row) return;

      this.existingValueId = row.id;

      // Mapear áreas (si vienen)
      if (Array.isArray(row.area_list) && row.area_list.length) {
        this.areas = this.areas.map((a, i) => {
          const r = row.area_list[i] ?? {};
          const rating = (r.rating ?? null) as ValueArea['rating'];
          const label = r.label ?? a.label;
          return { label, rating };
        });
      }

      // Mapear prioridades (si vienen)
      if (Array.isArray(row.priority_list) && row.priority_list.length) {
        this.priorities = row.priority_list.map((p: any) => ({
          name: String(p.name ?? ''),
          create: String(p.create ?? ''),
          improve: String(p.improve ?? ''),
        }));
        if (!this.priorities.length) this.priorities = [{ name: '', create: '', improve: '' }];
      }
    } catch (err) {
      console.error('Error cargando Value:', err);
    } finally {
      this.loading = false;
    }
  }

  addPriority(): void {
    if (this.priorities.length < 3) {
      this.priorities.push({ name: '', create: '', improve: '' });
    }
  }

  removePriority(index: number): void {
    if (this.priorities.length > 1) {
      this.priorities.splice(index, 1);
    }
  }

  // ===== Guardar (POST/PUT) con alertas =====
  async save(): Promise<void> {
    const area_list = this.areas.map(a => ({
      label: a.label,
      rating: a.rating
    }));

    const priority_list = this.priorities.map(p => ({
      name: p.name ?? '',
      create: p.create ?? '',
      improve: p.improve ?? ''
    }));

    const createDto = {
      id_company: this.id_company,
      area_list,
      priority_list,
      status: 1,
      created_by: this.created_by
    };

    const updateDto = {
      area_list,
      priority_list,
      status: 1,
      created_by: this.created_by
    };

    this.loading = true;
    try {
      if (this.existingValueId != null) {
        await this.cashService.updateValue(this.existingValueId, updateDto);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El formato Valor se actualizó correctamente.',
          confirmButtonColor: '#003660'
        });
      } else {
        const res = await this.cashService.createValue(createDto);
        const newId = res?.data?.id ?? res?.id;
        if (newId != null) this.existingValueId = Number(newId);

        await Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'El formato Valor se guardó correctamente.',
          confirmButtonColor: '#003660'
        });
      }

      console.log('Value guardado correctamente');
    } catch (err) {
      console.error('Error guardando Value:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el formato Valor. Inténtalo de nuevo.',
        confirmButtonColor: '#003660'
      });
    } finally {
      this.loading = false;
    }
  }
}
