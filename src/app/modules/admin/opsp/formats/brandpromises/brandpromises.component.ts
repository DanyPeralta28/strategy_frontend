import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

@Component({
  selector: 'app-brandpromises',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brandpromises.component.html',
  styleUrl: './brandpromises.component.scss'
})
export class BrandpromisesComponent implements OnInit {
  // Campos principales
  clienteCentral: string = ''; // no se sincroniza al endpoint de promesa de marca (viene de otro formato)
  promesaLider: string = '';
  promesa2: string = '';
  promesa3: string = '';

  // estado para decidir create/update
  id?: number;

  // contexto
  id_company: string = 'BANRURAL_GT3';
  created_by: string = 'admin_user';

  // snapshot para detectar cambios
  private originalSnapshot = {
    promesaLider: '',
    promesa2: '',
    promesa3: ''
  };

  constructor(public opspService: OpspService) {}

  ngOnInit(): void {
    this.loadBrandPromises();
  }

  loadBrandPromises(): void {
    this.opspService
      .getBrandPromiseByCompany(this.id_company)
      .then(resp => {
        if (resp?.data && resp.data.length > 0) {
          const existing = resp.data[0];
          this.id = existing.id;
          this.promesaLider = existing.primary_promise || '';
          this.promesa2 = existing.secondary_promise || '';
          this.promesa3 = existing.tertiary_promise || '';

          // snapshot
          this.originalSnapshot = {
            promesaLider: this.promesaLider,
            promesa2: this.promesa2,
            promesa3: this.promesa3
          };
        }
      })
      .catch(err => {
        console.error('Error cargando Promesa de Marca:', err);
      });
  }

  private hasChanges(): boolean {
    return (
      this.promesaLider.trim() !== (this.originalSnapshot.promesaLider || '').trim() ||
      this.promesa2.trim() !== (this.originalSnapshot.promesa2 || '').trim() ||
      this.promesa3.trim() !== (this.originalSnapshot.promesa3 || '').trim()
    );
  }

  save(): void {
    const payloadBase = {
      primary_promise: this.promesaLider.trim(),
      secondary_promise: this.promesa2.trim(),
      tertiary_promise: this.promesa3.trim(),
      created_by: this.created_by
    };

    const hasAnyPromise =
      this.promesaLider.trim() !== '' ||
      this.promesa2.trim() !== '' ||
      this.promesa3.trim() !== '';

    if (!hasAnyPromise) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Por favor completa al menos una promesa antes de guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    // si ya existe y no hubo cambios, no hacemos nada
    if (this.id && !this.hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron modificaciones para guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    let promise: Promise<any>;
    if (this.id) {
      promise = this.opspService.updateBrandPromise(this.id, payloadBase);
    } else {
      const payloadCreate = {
        ...payloadBase,
        id_company: this.id_company
      };
      promise = this.opspService.createBrandPromise(payloadCreate);
    }

    promise
      .then(res => {
        if (!this.id && res?.data && res.data[0]?.id) {
          this.id = res.data[0].id;
        }
        // actualizar snapshot
        this.originalSnapshot = {
          promesaLider: this.promesaLider,
          promesa2: this.promesa2,
          promesa3: this.promesa3
        };
        Swal.fire({
          icon: 'success',
          title: this.id ? '¡Actualizado!' : '¡Creado!',
          text: 'Promesa de Marca guardada correctamente.',
          confirmButtonColor: '#003660',
        });
      })
      .catch(err => {
        console.error('Error guardando Promesa de Marca:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la Promesa de Marca. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F',
        });
      });
  }
}
