import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

@Component({
  selector: 'app-fdt',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './fdt.component.html',
  styleUrl: './fdt.component.scss',
})
export class FdtComponent implements OnInit {
  fdtForm!: FormGroup;

  // contexto: reemplaza según tu flujo real (ruta / sesión)
  id_company: string = 'BANRURAL_GT2';
  existingFdtId: number | null = null;
  status = 1;
  created_by = 'admin_user';

  constructor(private fb: FormBuilder, public opspService: OpspService) { }

  ngOnInit(): void {
    this.fdtForm = this.fb.group({
      tendencias: this.fb.array([]), // global_trends_impact
      fortalezas: this.fb.array([]), // core_strengths
      debilidades: this.fb.array([]), // core_weaknesses
    });

    this.loadFdt();
  }

  /** Getters */
  get tendencias(): FormArray {
    return this.fdtForm.get('tendencias') as FormArray;
  }
  get fortalezas(): FormArray {
    return this.fdtForm.get('fortalezas') as FormArray;
  }
  get debilidades(): FormArray {
    return this.fdtForm.get('debilidades') as FormArray;
  }

  /** Helpers para crear grupos */
  private createTrendGroup(trend = '', impact = ''): FormGroup {
    return this.fb.group({
      trend: [trend],
      impact: [impact],
    });
  }

  private createStrengthGroup(strength = '', importance = ''): FormGroup {
    return this.fb.group({
      strength: [strength],
      importance: [importance],
    });
  }

  private createWeaknessGroup(weakness = '', severity = ''): FormGroup {
    return this.fb.group({
      weakness: [weakness],
      severity: [severity],
    });
  }

  addTrend(): void {
    this.tendencias.push(this.createTrendGroup());
  }
  removeTrend(index: number): void {
    this.tendencias.removeAt(index);
  }

  addStrength(): void {
    this.fortalezas.push(this.createStrengthGroup());
  }
  removeStrength(index: number): void {
    this.fortalezas.removeAt(index);
  }

  addWeakness(): void {
    this.debilidades.push(this.createWeaknessGroup());
  }
  removeWeakness(index: number): void {
    this.debilidades.removeAt(index);
  }

  trackByIndex(_index: number, _item: any): number {
    return _index;
  }

  /** Carga existente */
  loadFdt(): void {
    this.opspService
      .getFdtByCompany(this.id_company)
      .then(resp => {
        if (!resp?.data || resp.data.length === 0) {
          // no hay datos previos, queda vacío para mostrar los mensajes
          return;
        }

        const data = resp.data[0];

        if (data.id) {
          this.existingFdtId = data.id;
        }
        if (typeof data.status !== 'undefined') {
          this.status = data.status;
        }
        if (data.created_by) {
          this.created_by = data.created_by;
        }

        // tendencias
        this.tendencias.clear();
        (data.global_trends_impact || []).forEach((t: any) => {
          this.tendencias.push(this.createTrendGroup(t.trend || '', t.impact || ''));
        });

        // fortalezas
        this.fortalezas.clear();
        (data.core_strengths || []).forEach((s: any) => {
          this.fortalezas.push(this.createStrengthGroup(s.strength || '', s.importance || ''));
        });

        // debilidades
        this.debilidades.clear();
        (data.core_weaknesses || []).forEach((w: any) => {
          this.debilidades.push(this.createWeaknessGroup(w.weakness || '', w.severity || ''));
        });
      })
      .catch(err => {
        console.error('Error cargando FDT:', err);
      });
  }

  /** Construye el payload acorde al contrato */
  private buildFdtPayload(isCreate: boolean): any {
    const f = this.fdtForm.value;

    const payload: any = {
      global_trends_impact: (f.tendencias || []).map((t: any) => ({
        trend: t.trend,
        impact: t.impact,
      })),
      core_strengths: (f.fortalezas || []).map((s: any) => ({
        strength: s.strength,
        importance: s.importance,
      })),
      core_weaknesses: (f.debilidades || []).map((w: any) => ({
        weakness: w.weakness,
        severity: w.severity,
      })),
      status: this.status,
      created_by: this.created_by,
    };

    if (isCreate) {
      payload.id_company = this.id_company;
    }

    return payload;
  }

  /** Guardado */
  save(): void {
    if (this.fdtForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    const isCreate = !this.existingFdtId;
    const payload = this.buildFdtPayload(isCreate);

    Swal.fire({
      title: isCreate ? 'Creando...' : 'Actualizando...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    const promise: Promise<any> = isCreate
      ? this.opspService.createFdt(payload)
      : this.opspService.updateFdt(this.existingFdtId!, payload);

    promise
      .then(res => {
        if (isCreate && res?.data && res.data[0]?.id) {
          this.existingFdtId = res.data[0].id;
        }
        Swal.fire({
          icon: 'success',
          title: isCreate ? '¡Creado!' : '¡Actualizado!',
          text: 'FDT guardado correctamente.',
          confirmButtonColor: '#003660',
        });
      })
      .catch(err => {
        console.error('Error guardando FDT:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar FDT. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F',
        });
      });
  }
}
