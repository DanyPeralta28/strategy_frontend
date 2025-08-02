import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

@Component({
  selector: 'app-culture',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './culture.component.html',
  styleUrl: './culture.component.scss'
})
export class CultureComponent implements OnInit {
  form = {
    nombre: '',
    descripcion: '',
  };

  // contexto / constantes (ajústalas si vienen dinámicas)
  id_company: string = 'BANRURAL_GT3';
  created_by: string = 'admin_user';

  cultureId?: number;
  private originalSnapshot = {
    nombre: '',
    descripcion: ''
  };

  constructor(public opspService: OpspService) {}

  ngOnInit(): void {
    this.loadCulture();
  }

  private async loadCulture(): Promise<void> {
    try {
      const resp = await this.opspService.getCultureByCompany(this.id_company);
      if (resp?.data && resp.data.length > 0) {
        const existing = resp.data[0];
        this.cultureId = existing.id;
        this.form.nombre = existing.culture_name || '';
        this.form.descripcion = existing.culture_description || '';

        this.originalSnapshot = {
          nombre: this.form.nombre,
          descripcion: this.form.descripcion
        };
      }
    } catch (err) {
      console.error('Error cargando cultura:', err);
    }
  }

  private hasChanges(): boolean {
    return (
      this.form.nombre.trim() !== this.originalSnapshot.nombre.trim() ||
      this.form.descripcion.trim() !== this.originalSnapshot.descripcion.trim()
    );
  }

  async save(): Promise<void> {
    if (!this.form.nombre.trim() || !this.form.descripcion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa ambos campos antes de guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    if (this.cultureId && !this.hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron modificaciones para guardar.',
        confirmButtonColor: '#003660',
      });
      return;
    }

    const payloadBase: any = {
      culture_name: this.form.nombre.trim(),
      culture_description: this.form.descripcion.trim(),
      created_by: this.created_by
    };

    try {
      if (this.cultureId) {
        await this.opspService.updateCulture(this.cultureId, payloadBase);
      } else {
        const resp = await this.opspService.createCulture({
          ...payloadBase,
          id_company: this.id_company
        });
        if (resp?.data && resp.data[0]?.id) {
          this.cultureId = resp.data[0].id;
        }
      }

      // actualizar snapshot
      this.originalSnapshot = {
        nombre: this.form.nombre,
        descripcion: this.form.descripcion
      };

      Swal.fire({
        icon: 'success',
        title: this.cultureId ? '¡Actualizado!' : '¡Creado!',
        text: 'La cultura se ha guardado correctamente.',
        confirmButtonColor: '#003660',
      });
    } catch (err) {
      console.error('Error guardando cultura:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la cultura. Intenta nuevamente.',
        confirmButtonColor: '#D32F2F',
      });
    }
  }
}
