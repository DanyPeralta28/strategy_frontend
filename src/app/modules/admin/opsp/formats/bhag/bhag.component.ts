import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service'

@Component({
  selector: 'app-bhag',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './bhag.component.html',
  styleUrl: './bhag.component.scss'
})
export class BhagComponent {
  form = {
    description: '',
    id: '',
    created_by: "admin_user"
  };
  id_company: any;

  constructor(public opspService: OpspService) { }

  ngOnInit() {
    this.id_company = "BANRURAL_GT99";
    this.loadBhag();
  }

  loadBhag() {
    this.opspService
      .getBhagByCompany(this.id_company)
      .then(bhag => {
        this.form.description = bhag.data[0].description;
        this.form.id = bhag.data[0].id;
        console.log("BHAG recibido:", bhag.data);
      })
      .catch(err => {
        console.error("Error cargando BHAG:", err);
      });
  }

  save(): void {
    const { id, description, created_by } = this.form;
    let obj = {
      id_company: this.id_company,
      description,
      created_by
    }

    if (!description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa el BHAG® y su descripción.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    // Prepara la promesa según si es creación o edición:
    let promise: Promise<any>;
    if (id) {
      promise = this.opspService.updateBhag(id, { description, created_by });
    } else {
      promise = this.opspService.createBhag(obj);
    }

    console.log('BHAG® guardado:', this.form);

    promise
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: id ? '¡Actualizado!' : '¡Creado!',
          text: 'Los datos se han guardado correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch(error => {
        console.error('Error guardando BHAG®:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el BHAG®. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }
}
