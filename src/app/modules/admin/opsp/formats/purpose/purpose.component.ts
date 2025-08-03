import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

@Component({
  selector: 'app-purpose',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './purpose.component.html',
  styleUrl: './purpose.component.scss'
})
export class PurposeComponent implements OnInit {
  form: {
    purpose: string;
    id?: number;
    created_by: string;
  } = {
    purpose: '',
    created_by: 'admin_user'
  };

  id_company: string = 'BANRURAL_GT2'; // ajustar según contexto real

  constructor(public opspService: OpspService) {}

  ngOnInit() {
    this.loadPurpose();
  }

  loadPurpose(): void {
    this.opspService
      .getPurposeByCompany(this.id_company)
      .then(resp => {
        if (resp?.data && resp.data.length > 0) {
          const existing = resp.data[0];
          this.form.purpose = existing.purpose_description || '';
          this.form.id = existing.id;
        }
      })
      .catch(err => {
        console.error('Error cargando propósito:', err);
      });
  }

  save(): void {
    const { purpose, id, created_by } = this.form;

    if (!purpose.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa el propósito.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const payloadCreate = {
      id_company: this.id_company,
      purpose_description: purpose,
      created_by
    };
    const payloadUpdate = {
      purpose_description: purpose,
      created_by
    };

    let promise: Promise<any>;
    if (id) {
      promise = this.opspService.updatePurpose(id, payloadUpdate);
    } else {
      promise = this.opspService.createPurpose(payloadCreate);
    }

    promise
      .then(response => {
        // si fue creación y regresa id, asignarlo
        if (!id && response?.data && response.data[0]?.id) {
          this.form.id = response.data[0].id;
        }

        Swal.fire({
          icon: 'success',
          title: id ? '¡Actualizado!' : '¡Creado!',
          text: 'Los datos se han guardado correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch(error => {
        console.error('Error guardando propósito:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el propósito. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }
}
