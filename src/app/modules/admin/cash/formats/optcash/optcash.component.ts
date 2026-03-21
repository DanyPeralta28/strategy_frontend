import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CashService } from '../../../services/cash.service'; // ajusta ruta
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

interface StageItem {
  idea: string;
  reduction: string;
  errors: string;
  gap: string;
}

interface Stage {
  letter: string;
  title: string;
  editing: boolean;
  items: StageItem[];
}

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
  selector: 'app-optcash',
  imports: [CommonModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
  templateUrl: './optcash.component.html',
  styleUrl: './optcash.component.scss'
})
export class OptcashComponent implements OnInit {
  // contexto (ajusta según tu app)
  id_company = getSessionCompanyId();
  created_by = getSessionUserId();

  stages: Stage[] = [
    {
      letter: 'A',
      title: 'Ideas para mejorar el Ciclo de Ventas',
      editing: false,
      items: Array(1).fill(null).map(() => this.createItem()),
    },
    {
      letter: 'B',
      title: 'Ideas para mejorar el Ciclo de Manufactura/Producción e Inventario',
      editing: false,
      items: Array(1).fill(null).map(() => this.createItem()),
    },
    {
      letter: 'C',
      title: 'Ideas para mejorar el Ciclo de Entrega/Distribución',
      editing: false,
      items: Array(1).fill(null).map(() => this.createItem()),
    },
    {
      letter: 'D',
      title: 'Ideas para mejorar el Ciclo de Facturación y Cobro',
      editing: false,
      items: Array(1).fill(null).map(() => this.createItem()),
    }
  ];

  private existingOptcashId: number | null = null;
  loading = false;

  constructor(private cashService: CashService) {}

  async ngOnInit(): Promise<void> {
    await this.loadOptcash();
  }

  private async loadOptcash(): Promise<void> {
    this.loading = true;
    try {
      const resp = await this.cashService.getAllOptcashByCompany(this.id_company);
      const row = resp?.data?.[0];
      if (!row) return;

      this.existingOptcashId = row.id;

      // Preferir "ideas" si viene en el payload
      const ideas = Array.isArray(row.ideas) && row.ideas.length
        ? row.ideas
        : this.flattenIdeaLists(row);

      // Mapear al modelo UI
      const map: Record<string, Stage> = {};
      for (const s of this.stages) map[s.letter] = s;

      ideas.forEach((it: any) => {
        const target = map[it.letter];
        if (!target) return;
        target.title = it.title ?? target.title;
        target.editing = !!it.editing;
        target.items = (it.items || []).map((x: any) => ({
          idea: String(x.idea ?? ''),
          reduction: String(x.reduction ?? ''),
          errors: String(x.errors ?? ''),
          gap: String(x.gap ?? ''),
        }));
        if (!target.items.length) target.items = [this.createItem()];
      });
    } catch (err) {
      console.error('Error cargando Optcash:', err);
    } finally {
      this.loading = false;
    }
  }

  // Soporta respuesta con idea_a_list, idea_b_list, etc.
  private flattenIdeaLists(row: any) {
    const lists = [
      { letter: 'A', key: 'idea_a_list' },
      { letter: 'B', key: 'idea_b_list' },
      { letter: 'C', key: 'idea_c_list' },
      { letter: 'D', key: 'idea_d_list' },
    ];
    return lists.map(({ letter, key }) => {
      const first = Array.isArray(row[key]) && row[key][0] ? row[key][0] : {};
      return {
        letter,
        title: first.title ?? '',
        items: Array.isArray(first.items) ? first.items : [],
        editing: !!first.editing,
      };
    });
  }

  createItem(): StageItem {
    return { idea: '', reduction: '', errors: '', gap: '' };
  }

  addItem(stageIndex: number): void {
    this.stages[stageIndex].items.push(this.createItem());
  }

  removeItem(stageIndex: number, itemIndex: number): void {
    this.stages[stageIndex].items.splice(itemIndex, 1);
  }

  toggleEdit(index: number): void {
    this.stages[index].editing = !this.stages[index].editing;
  }

  getInputWidth(text: string): number {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.fontWeight = '600';
    span.style.fontSize = '1rem';
    span.innerText = text || '';
    document.body.appendChild(span);
    const width = span.offsetWidth + 20;
    document.body.removeChild(span);
    return width;
  }

  // ===== Guardar (POST/PUT) con alertas =====
  async save(): Promise<void> {
    const payloadIdeas = this.stages.map(s => ({
      letter: s.letter,
      title: s.title,
      items: s.items.map(i => ({
        idea: i.idea ?? '',
        reduction: i.reduction ?? '',
        errors: i.errors ?? '',
        gap: i.gap ?? '',
      })),
      editing: !!s.editing
    }));

    const createDto = {
      id_company: this.id_company,
      ideas: payloadIdeas,
      status: 1,
      created_by: this.created_by
    };

    const updateDto = {
      ideas: payloadIdeas,
      status: 1,
      created_by: this.created_by
    };

    this.loading = true;
    try {
      if (this.existingOptcashId != null) {
        await this.cashService.updateOptcash(this.existingOptcashId, updateDto);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El formato de Optimización de Efectivo se actualizó correctamente.',
          confirmButtonColor: '#003660'
        });
      } else {
        const res = await this.cashService.createOptcash(createDto);
        const newId = res?.data?.id ?? res?.id;
        if (newId != null) this.existingOptcashId = Number(newId);

        await Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'El formato de Optimización de Efectivo se guardó correctamente.',
          confirmButtonColor: '#003660'
        });
      }

      console.log('Optcash guardado correctamente');
    } catch (err) {
      console.error('Error guardando Optcash:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el formato. Inténtalo de nuevo.',
        confirmButtonColor: '#003660'
      });
    } finally {
      this.loading = false;
    }
  }
}






