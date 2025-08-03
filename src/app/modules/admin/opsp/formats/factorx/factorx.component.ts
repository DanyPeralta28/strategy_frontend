import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service'; // ajusta la ruta si es diferente

@Component({
  selector: 'app-factorx',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './factorx.component.html',
  styleUrl: './factorx.component.scss',
})
export class FactorxComponent implements OnInit {
  // Ajusta esto si obtienes la compañía dinámicamente
  id_company = 'BANRURAL_GT2';
  factorXId: number | null = null;

  stepGrid: any[] = [
    { type: 'start', icon: '💡', label: 'INICIO' },
    { type: 'step', step_order: 1, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 2, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 3, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 4, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 5, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 6, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 7, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 8, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 9, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'step', step_order: 10, step_label: '', has_inefficiency: false, symbol: '' },
    { type: 'end', icon: '📦', label: '$$$' }
  ];

  bottlenecks: Array<{ descripcion: string; lider: string; fecha: string }> = [
    { descripcion: '', lider: '', fecha: '' }
  ];

  ferias: Array<{ descripcion: string; lider: string; fecha: string }> = [
    { descripcion: '', lider: '', fecha: '' }
  ];

  constructor(private opspService: OpspService) { }

  ngOnInit(): void {
    this.loadFactorX();
  }

  loadFactorX(): void {
    // Asegúrate de que exista getFactorXByCompany en el servicio; si no lo tienes, lo agregamos abajo.
    this.opspService
      // @ts-ignore: si usas un método nuevo en el service que aún no está tipado aquí
      .getFactorXByCompany(this.id_company)
      .then((res: any) => {
        if (res?.data?.length) {
          const fx = res.data[0];
          this.factorXId = fx.id;

          // Mapear pasos
          if (Array.isArray(fx.process_flow_steps)) {
            fx.process_flow_steps.forEach((s: any) => {
              const box = this.stepGrid.find(
                b => b.type === 'step' && b.step_order === s.step_order
              );
              if (box) {
                box.step_label = s.step_label || '';
                box.has_inefficiency = s.has_inefficiency || false;
                box.symbol = s.symbol || '';
              }
            });
          }

          // Mapear cuellos de botella
          if (Array.isArray(fx.bottleneck_list) && fx.bottleneck_list.length) {
            this.bottlenecks = fx.bottleneck_list.map((b: any) => ({
              descripcion: b.description || '',
              lider: b.leader || '',
              fecha: b.due_date || ''
            }));
          }

          // Mapear ferias
          if (Array.isArray(fx.trade_action_list) && fx.trade_action_list.length) {
            this.ferias = fx.trade_action_list.map((t: any) => ({
              descripcion: t.name || '',
              lider: t.leader || '',
              fecha: t.date || ''
            }));
          }
        }
      })
      .catch((err: any) => {
        console.error('Error cargando Factor X:', err);
      });
  }

  toggleInefficiency(box: any): void {
    box.has_inefficiency = !box.has_inefficiency;
  }

  addBottleneck(): void {
    this.bottlenecks.push({ descripcion: '', lider: '', fecha: '' });
  }

  removeBottleneck(index: number): void {
    if (this.bottlenecks.length > 1) {
      this.bottlenecks.splice(index, 1);
    }
  }

  addFeria(): void {
    this.ferias.push({ descripcion: '', lider: '', fecha: '' });
  }

  removeFeria(index: number): void {
    if (this.ferias.length > 1) {
      this.ferias.splice(index, 1);
    }
  }

  save(): void {
    const process_flow_steps = this.stepGrid
      .filter(step => step.type === 'step')
      .map(step => ({
        step_order: step.step_order,
        step_label: step.step_label,
        has_inefficiency: step.has_inefficiency,
        symbol: step.symbol || ''
      }));

    const bottleneck_list = this.bottlenecks
      .filter(b => b.descripcion.trim() || b.lider.trim() || b.fecha)
      .map(b => ({
        description: b.descripcion,
        leader: b.lider,
        due_date: b.fecha
      }));

    const trade_action_list = this.ferias
      .filter(f => f.descripcion.trim() || f.lider.trim() || f.fecha)
      .map(f => ({
        name: f.descripcion,
        leader: f.lider,
        date: f.fecha
      }));

    const payload: any = {
      process_flow_steps,
      bottleneck_list,
      trade_action_list,
      created_by: 'admin_user'
    };

    if (!this.factorXId) {
      payload.id_company = this.id_company;
    }

    const promise = this.factorXId
      ? this.opspService.updateFactorX(this.factorXId, payload)
      : this.opspService.createFactorX(payload);

    promise
      .then((response: any) => {
        // Si fue creación, actualizar el ID local si viene
        if (!this.factorXId && response?.data?.id) {
          this.factorXId = response.data.id;
        }

        Swal.fire({
          icon: 'success',
          title: this.factorXId ? '¡Actualizado!' : '¡Creado!',
          text: 'Los datos se han guardado correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch((error: any) => {
        console.error('Error guardando Factor X:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar Factor X. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }
}
