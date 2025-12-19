import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

interface CoreValueItem {
  id?: number;
  uid: string;
  value_title: string;
  short_description: string;
  long_description: string;
  // metadata que vino originalmente (para snapshot)
}

@Component({
  selector: 'app-corevalues',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './corevalues.component.html',
  styleUrl: './corevalues.component.scss'
})
export class CorevaluesComponent implements OnInit {
  coreValues: CoreValueItem[] = [];
  originalCoreValues: CoreValueItem[] = [];

  // contexto fijo por ahora; puedes inyectar / obtener de ruta
  id_company: string = 'BANRURAL_GT99';
  created_by: string = 'admin_user';

  constructor(public opspService: OpspService) { }

  ngOnInit(): void {
    this.loadCoreValues();
  }

  private makeUid(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /** Carga desde API */
  loadCoreValues(): void {
    // Asegúrate de tener este método en el service: getCoreValueByCompany
    this.opspService
      .getCoreValuesByCompany(this.id_company)
      .then(resp => {
        const dataArray = resp?.data || [];
        if (!dataArray.length) {
          // inicializar con uno vacío
          this.coreValues = [
            {
              uid: this.makeUid(),
              value_title: '',
              short_description: '',
              long_description: ''
            }
          ];
          this.originalCoreValues = this.coreValues.map(v => ({ ...v }));
          return;
        }

        // mapear respuestas
        this.coreValues = dataArray.map((d: any) => ({
          id: d.id,
          uid: d.id ? `existing-${d.id}` : this.makeUid(),
          value_title: d.value_title || '',
          short_description: d.short_description || '',
          long_description: d.long_description || ''
        }));

        this.originalCoreValues = this.coreValues.map(v => ({ ...v }));
      })
      .catch(err => {
        console.error('Error cargando Valores Centrales:', err);
        // fallback con uno vacío
        this.coreValues = [
          {
            uid: this.makeUid(),
            value_title: '',
            short_description: '',
            long_description: ''
          }
        ];
        this.originalCoreValues = this.coreValues.map(v => ({ ...v }));
      });
  }

  agregarValor(): void {
    this.coreValues.push({
      uid: this.makeUid(),
      value_title: '',
      short_description: '',
      long_description: ''
    });
  }

  eliminarValor(index: number): void {
    this.coreValues.splice(index, 1);
  }

  private isSameValue(a: CoreValueItem, b: CoreValueItem): boolean {
    return (
      a.value_title === b.value_title &&
      a.short_description === b.short_description &&
      a.long_description === b.long_description
    );
  }

  trackByValor(_index: number, item: CoreValueItem): any {
    return item.uid;
  }

  /** Guardado con create / update / delete */
  guardarValores(): void {
    // filtrar vacíos (todos los campos vacíos)
    const valoresFiltrados = this.coreValues.filter(v =>
      v.value_title.trim() !== '' ||
      v.short_description.trim() !== '' ||
      v.long_description.trim() !== ''
    );

    // preparar operaciones
    const promises: Promise<any>[] = [];

    // 1. detectar eliminados: originales con id que ya no están
    const originalesConId = this.originalCoreValues.filter(o => o.id);
    originalesConId.forEach(original => {
      const sigueExistiendo = this.coreValues.some(cv => cv.id === original.id);
      if (!sigueExistiendo && original.id) {
        // fue eliminado en UI: eliminar en backend
        promises.push(this.opspService.deleteCoreValue(original.id));
      }
    });

    // 2. crear / actualizar actuales
    valoresFiltrados.forEach(item => {
      if (item.id) {
        // existe: ver si cambió
        const original = this.originalCoreValues.find(o => o.id === item.id);
        if (!original || !this.isSameValue(original, item)) {
          const payload = {
            value_title: item.value_title,
            short_description: item.short_description,
            long_description: item.long_description,
            created_by: this.created_by
          };
          promises.push(
            this.opspService.updateCoreValue(item.id, payload).then(res => {
              if (original) Object.assign(original, { ...item });
              return res;
            })
          );
        }
      } else {
        // nuevo
        const payload = {
          id_company: this.id_company,
          value_title: item.value_title,
          short_description: item.short_description,
          long_description: item.long_description,
          created_by: this.created_by
        };
        promises.push(
          this.opspService.createCoreValue(payload).then(res => {
            // si viene id, asignarlo
            if (res?.data && res.data[0]?.id) {
              item.id = res.data[0].id;
              this.originalCoreValues.push({ ...item });
            }
            return res;
          })
        );
      }
    });

    if (promises.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron cambios para guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    Promise.allSettled(promises).then(results => {
      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      let title = '¡Guardado!';
      let icon: any = 'success';
      if (failures && successes) {
        title = 'Resultado mixto';
        icon = 'warning';
      } else if (failures && !successes) {
        title = 'Error';
        icon = 'error';
      }

      Swal.fire({
        icon,
        title,
        text: `${successes} éxitos, ${failures} errores.`.trim(),
        confirmButtonColor: '#003660'
      });

      // refrescar snapshot si al menos hubo éxito
      if (successes) {
        this.originalCoreValues = this.coreValues.map(v => ({ ...v }));
      }
    });
  }
}
