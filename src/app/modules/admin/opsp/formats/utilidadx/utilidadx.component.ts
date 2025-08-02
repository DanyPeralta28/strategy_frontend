import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

@Component({
  selector: 'app-utilidadx',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilidadx.component.html',
  styleUrl: './utilidadx.component.scss'
})
export class UtilidadxComponent implements OnInit {
  utilidadPorX: string = '';

  // Estado para create vs update
  id_company: string = 'BANRURAL_GT3';    // reemplazar según contexto real
  existingId: number | null = null;
  originalDefinition: string = '';
  created_by: string = 'admin_user';

  constructor(private opspService: OpspService) { }

  ngOnInit(): void {
    this.loadUtilidadPorX();
  }

  private loadUtilidadPorX(): void {
    this.opspService
      .getProfitPerXByCompany(this.id_company)
      .then(resp => {
        if (!resp?.data || resp.data.length === 0) {
          return;  // no existe aún
        }
        const rec = resp.data[0];
        if (rec.id) {
          this.existingId = rec.id;
        }
        this.originalDefinition = rec.profit_per_x_definition || '';
        this.utilidadPorX = this.originalDefinition;
      })
      .catch(err => {
        console.error('Error cargando Utilidad por X:', err);
      });
  }

  guardar(): void {
    const value = this.utilidadPorX.trim();
    if (!value) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor describe tu indicador de Utilidad por X.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    // Solo enviar si cambió o es nuevo
    if (this.existingId && value === this.originalDefinition) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'La definición no ha cambiado.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const payload: any = {
      profit_per_x_definition: value,
      created_by: this.created_by
    };
    let promise: Promise<any>;

    if (this.existingId) {
      // Update
      promise = this.opspService.updateProfitPerX(this.existingId, payload);
    } else {
      // Create
      payload.id_company = this.id_company;
      promise = this.opspService.createProfitPerX(payload);
    }

    Swal.fire({
      title: this.existingId ? 'Actualizando...' : 'Guardando...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false
    });

    promise
      .then(res => {
        // Si fue creación y recibimos el ID
        if (!this.existingId && res?.data?.[0]?.id) {
          this.existingId = res.data[0].id;
        }
        this.originalDefinition = value;
        Swal.fire({
          icon: 'success',
          title: this.existingId ? '¡Actualizado!' : '¡Creado!',
          text: 'Utilidad por X guardada correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch(err => {
        console.error('Error guardando Utilidad por X:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }
}
