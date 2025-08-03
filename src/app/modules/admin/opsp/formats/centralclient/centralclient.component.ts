import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service';

@Component({
  selector: 'app-central-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centralclient.component.html', // ajusta si tu archivo se llama distinto
  styleUrl: './centralclient.component.scss'
})
export class CentralClientComponent implements OnInit {
  // contexto (ajústalo si lo pasas dinámicamente)
  id_company: string = 'BANRURAL_GT2';
  created_by: string = 'admin_user';

  centralClientId?: number;
  descripcionResumen: string = '';

  // snapshot para detectar cambios
  private originalSnapshot: Record<string, string> = {};

  preguntas: Array<{ key: string; pregunta: string; respuesta: string }> = [
    { key: 'age_gender_education', pregunta: 'Edad, género y educación', respuesta: '' },
    { key: 'appearance_description', pregunta: 'Apariencia', respuesta: '' },
    { key: 'typical_day_description', pregunta: 'Día típico', respuesta: '' },
    { key: 'fears_or_concerns', pregunta: 'Miedos o preocupaciones', respuesta: '' },
    { key: 'client_goals', pregunta: 'Metas del cliente', respuesta: '' },
    { key: 'client_challenges', pregunta: 'Retos del cliente', respuesta: '' },
    { key: 'life_priorities', pregunta: 'Prioridades de vida', respuesta: '' },
    { key: 'motivations_or_rewards', pregunta: 'Motivaciones o recompensas', respuesta: '' },
    { key: 'feelings_of_attractiveness', pregunta: 'Sentirse atractivo cuando...', respuesta: '' },
    { key: 'feelings_of_discomfort', pregunta: 'Sensación de incomodidad', respuesta: '' },
    { key: 'success_metrics', pregunta: 'Métricas de éxito', respuesta: '' },
    { key: 'key_needs_from_us', pregunta: 'Necesidades clave de nosotros', respuesta: '' },
  ];

  constructor(public opspService: OpspService) {}

  ngOnInit(): void {
    this.loadCentralClient();
  }

  private buildSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    this.preguntas.forEach(p => {
      snapshot[p.key] = (p.respuesta || '').trim();
    });
    snapshot['core_client_summary'] = (this.descripcionResumen || '').trim();
    return snapshot;
  }

  private hasChanges(): boolean {
    const current = this.buildSnapshot();
    for (const key of Object.keys(current)) {
      if (current[key] !== (this.originalSnapshot[key] || '')) {
        return true;
      }
    }
    return false;
  }

  private async loadCentralClient(): Promise<void> {
    try {
      const resp = await this.opspService.getCentralClientByCompany(this.id_company);
      if (resp?.data && resp.data.length > 0) {
        const existing = resp.data[0];
        this.centralClientId = existing.id;

        this.preguntas.forEach(p => {
          if (existing[p.key] !== undefined) {
            p.respuesta = existing[p.key] || '';
          }
        });

        this.descripcionResumen = existing.core_client_summary || '';
        this.originalSnapshot = this.buildSnapshot();
      }
    } catch (err) {
      console.error('Error cargando Cliente Central:', err);
    }
  }

  async save(): Promise<void> {
    const anyFieldFilled =
      this.preguntas.some(p => p.respuesta.trim() !== '') || this.descripcionResumen.trim() !== '';
    if (!anyFieldFilled) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Por favor completa al menos un campo antes de guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    if (this.centralClientId && !this.hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron modificaciones para guardar.',
        confirmButtonColor: '#003660'
      });
      return;
    }

    const payload: any = {};
    this.preguntas.forEach(p => {
      payload[p.key] = p.respuesta.trim();
    });
    payload.core_client_summary = this.descripcionResumen.trim();
    payload.created_by = this.created_by;

    try {
      if (this.centralClientId) {
        // update (no lleva id_company según el contrato de ejemplo)
        await this.opspService.updateCentralClient(this.centralClientId, payload);
      } else {
        // create
        payload.id_company = this.id_company;
        const resp = await this.opspService.createCentralClient(payload);
        if (resp?.data && resp.data[0]?.id) {
          this.centralClientId = resp.data[0].id;
        }
      }

      this.originalSnapshot = this.buildSnapshot();
      Swal.fire({
        icon: 'success',
        title: this.centralClientId ? '¡Actualizado!' : '¡Creado!',
        text: 'La información de Cliente Central se ha guardado correctamente.',
        confirmButtonColor: '#003660'
      });
    } catch (err) {
      console.error('Error guardando Cliente Central:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar. Intenta nuevamente.',
        confirmButtonColor: '#D32F2F'
      });
    }
  }
}
