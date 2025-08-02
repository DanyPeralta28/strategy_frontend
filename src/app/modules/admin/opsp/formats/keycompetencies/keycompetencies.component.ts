import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

interface CompetencyItem {
  name: string;
  description: string;
}

interface KeyCompetenciesForm {
  central: string;
  centralExplanation: string;
  claveCompetencias: Array<{ nombre: string; descripcion: string }>;
  id?: number;
}

@Component({
  selector: 'app-keycompetencies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './keycompetencies.component.html',
  styleUrl: './keycompetencies.component.scss'
})
export class KeycompetenciesComponent implements OnInit {
  form: KeyCompetenciesForm = {
    central: '',
    centralExplanation: '',
    claveCompetencias: [{ nombre: '', descripcion: '' }]
  };

  // contexto
  id_company: string = 'BANRURAL_GT3';
  created_by: string = 'admin_user';

  originalSnapshot: KeyCompetenciesForm = { ...this.form };

  constructor(public opspService: OpspService) { }

  ngOnInit(): void {
    this.loadCompetencies();
  }

  loadCompetencies(): void {
    this.opspService
      .getCompetenciesByCompany(this.id_company)
      .then(resp => {
        if (resp?.data && resp.data.length > 0) {
          const existing = resp.data[0];
          this.form.central = existing.core_competency || '';
          this.form.centralExplanation = existing.competency_description || '';
          this.form.claveCompetencias = (existing.competencies_list || []).map((c: any) => ({
            nombre: c.name || '',
            descripcion: c.description || ''
          }));
          this.form.id = existing.id;
          // snapshot de comparación
          this.originalSnapshot = {
            central: this.form.central,
            centralExplanation: this.form.centralExplanation,
            claveCompetencias: this.form.claveCompetencias.map(c => ({ ...c }))
          };
        }
      })
      .catch(err => {
        console.error('Error cargando competencias clave:', err);
        // dejar el formulario inicial
      });
  }

  addCompetencia(): void {
    this.form.claveCompetencias.push({ nombre: '', descripcion: '' });
  }

  removeCompetencia(index: number): void {
    this.form.claveCompetencias.splice(index, 1);
  }

  private filterCompetencias(): CompetencyItem[] {
    return this.form.claveCompetencias
      .filter(c => c.nombre.trim() !== '' || c.descripcion.trim() !== '')
      .map(c => ({
        name: c.nombre.trim(),
        description: c.descripcion.trim()
      }));
  }

  private hasChanges(): boolean {
    if (!this.originalSnapshot) return true;
    if (this.form.central.trim() !== (this.originalSnapshot.central || '').trim()) return true;
    if (this.form.centralExplanation.trim() !== (this.originalSnapshot.centralExplanation || '').trim()) return true;

    const origList = this.originalSnapshot.claveCompetencias || [];
    const currList = this.form.claveCompetencias || [];

    if (origList.length !== currList.length) return true;

    for (let i = 0; i < currList.length; i++) {
      const o = origList[i];
      const c = currList[i];
      if (!o || !c) return true;
      if (o.nombre.trim() !== c.nombre.trim()) return true;
      if (o.descripcion.trim() !== c.descripcion.trim()) return true;
    }

    return false;
  }

  save(): void {
    // validaciones
    if (!this.form.central.trim() || !this.form.centralExplanation.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa la competencia central y su explicación.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const competenciasFiltradas = this.filterCompetencias();

    const payloadCreate = {
      id_company: this.id_company,
      core_competency: this.form.central.trim(),
      competency_description: this.form.centralExplanation.trim(),
      competencies_list: competenciasFiltradas,
      created_by: this.created_by
    };

    const payloadUpdate = {
      core_competency: this.form.central.trim(),
      competency_description: this.form.centralExplanation.trim(),
      competencies_list: competenciasFiltradas,
      created_by: this.created_by
    };

    // si no hay cambios, evitar llamada
    if (this.form.id && !this.hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron modificaciones para guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    let promise: Promise<any>;
    if (this.form.id) {
      promise = this.opspService.updateCompetency(this.form.id, payloadUpdate);
    } else {
      promise = this.opspService.createCompetency(payloadCreate);
    }

    promise
      .then(res => {
        if (!this.form.id && res?.data && res.data[0]?.id) {
          this.form.id = res.data[0].id;
        }
        // refrescar snapshot
        this.originalSnapshot = {
          central: this.form.central,
          centralExplanation: this.form.centralExplanation,
          claveCompetencias: this.form.claveCompetencias.map(c => ({ ...c }))
        };
        Swal.fire({
          icon: 'success',
          title: this.form.id ? '¡Actualizado!' : '¡Creado!',
          text: 'Competencias clave guardadas correctamente.',
          confirmButtonColor: '#003660'
        });
      })
      .catch(err => {
        console.error('Error guardando competencias clave:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar. Intenta nuevamente.',
          confirmButtonColor: '#D32F2F'
        });
      });
  }
}
