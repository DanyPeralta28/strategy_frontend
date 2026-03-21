import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EjecucionService } from 'app/modules/admin/services/ejecucion.service';
import Swal from 'sweetalert2';

interface SurveyHabit {
  label: string;
  score: number | null;
}

interface SurveySegment {
  id: number;
  name: string;
  habits: SurveyHabit[];
}

@Component({
  selector: 'app-encuesta-rockefeller',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './encuesta-rockefeller.component.html',
  styleUrl: './encuesta-rockefeller.component.scss',
})
export class EncuestaRockefellerComponent implements OnInit {
  hash = '';
  sending = false;
  idCompany: number | null = null;
  idEntity: number | null = null;
  idCampaign: number | null = null;
  isCampaignActive = true;

  segments: SurveySegment[] = [
    {
      id: 1,
      name: 'El equipo directivo esta alineado y tiene una dinamica saludable.',
      habits: [
        { label: 'Los integrantes del equipo comprenden las diferencias, prioridades y estilos de cada uno.', score: null },
        { label: 'El equipo se reune frecuentemente para pensar en la estrategia (idealmente una vez por semana).', score: null },
        { label: 'El equipo dedica tiempo para formacion empresarial (recomendado mensualmente).', score: null },
        { label: 'El equipo puede participar en debates constructivos y todos los integrantes se sienten comodos participando.', score: null },
      ],
    },
    {
      id: 2,
      name: 'Todos estan alineados con la prioridad #1 que se debe lograr este trimestre para que la compania avance.',
      habits: [
        { label: 'Esta identificado el Numero Critico trimestral para que la compania avance.', score: null },
        { label: 'Estan identificadas y ordenadas las 3-5 Prioridades que soportan el Numero Critico trimestral.', score: null },
        { label: 'Estan anunciados el tema trimestral y la celebracion/recompensa a todos los empleados que dan vida al Numero Critico.', score: null },
        { label: 'Se comunica semanalmente a los empleados el progreso del tema trimestral y el Numero Critico.', score: null },
      ],
    },
    {
      id: 3,
      name: 'Esta establecido un ritmo de comunicacion y la informacion se traslada a la organizacion de forma clara y rapida.',
      habits: [
        { label: 'Todos los empleados participan en una reunion diaria que dura menos de 15 minutos.', score: null },
        { label: 'Todos los equipos tienen una reunion semanal.', score: null },
        { label: 'Gerentes y mandos medios se reunen un dia al mes para aprendizaje, solucionar temas importantes y transferencia de ADN.', score: null },
        { label: 'Gerentes y mandos medios se reunen fuera de la oficina de forma trimestral y anual para trabajar en las 4 Decisiones.', score: null },
      ],
    },
    {
      id: 4,
      name: 'Cada tarea en la organizacion esta asignada a una persona que rinde cuentas de la consecucion de los objetivos.',
      habits: [
        { label: 'El cuadro de Funciones y Responsabilidad esta completo (personas correctas, en el lugar correcto, haciendo las cosas correctas).', score: null },
        { label: 'Hay una persona asignada para cada una de las lineas de los estados financieros.', score: null },
        { label: 'Hay una persona que rinde cuentas de cada uno de los procesos descritos en el Cuadro de Procesos y Responsabilidad.', score: null },
        { label: 'Para cada una de las capacidades clave a 3-5 anos, hay un experto interno o en el Consejo de Administracion.', score: null },
      ],
    },
    {
      id: 5,
      name: 'Se recogen las sugerencias de los empleados para identificar problemas y oportunidades.',
      habits: [
        { label: 'Gerentes y mandos medios tienen una conversacion empezar/parar/continuar con al menos un empleado a la semana.', score: null },
        { label: 'Las ideas surgidas de las conversaciones con los empleados son compartidas en la reunion semanal del equipo gerencial.', score: null },
        { label: 'Las aportaciones del empleado acerca de los problemas y oportunidades se recogen semanalmente.', score: null },
        { label: 'Los mandos medios son responsables del proceso de cerrar el circulo de todos los problemas y oportunidades.', score: null },
      ],
    },
    {
      id: 6,
      name: 'El reporte y analisis de los comentarios del cliente son tan frecuentes y precisos como los datos financieros.',
      habits: [
        { label: 'Gerentes y mandos medios tienen una conversacion 4Q con un cliente final al menos una vez a la semana.', score: null },
        { label: 'Las conclusiones de las conversaciones con los clientes son compartidas en la reunion semanal del equipo gerencial.', score: null },
        { label: 'Todos los empleados estan involucrados en la recoleccion de datos de los clientes.', score: null },
        { label: 'Los mandos medios son responsables del proceso de cerrar el circulo de todos los comentarios/quejas de los clientes.', score: null },
      ],
    },
    {
      id: 7,
      name: 'Los Valores y el Proposito se viven dentro de la organizacion.',
      habits: [
        { label: 'Los Valores y el Proposito estan definidos claramente y ambos son conocidos por todos los empleados.', score: null },
        { label: 'Gerentes y mandos medios se refieren a los Valores y el Proposito cuando premian o reganan.', score: null },
        { label: 'Los procesos y actividades de RRHH se alinean con los Valores y el Proposito (contratacion, orientacion, evaluacion, reconocimiento, etc.).', score: null },
        { label: 'Cada trimestre se identifican e implementan acciones que refuercen los Valores y Proposito en la organizacion.', score: null },
      ],
    },
    {
      id: 8,
      name: 'Los empleados pueden explicar, con seguridad, los componentes clave de la estrategia de la compania.',
      habits: [
        { label: 'El objetivo grande, peludo y audaz (BHAG): el progreso es rastreado y visible.', score: null },
        { label: 'Cliente(s) Principal(es): su perfil en 25 palabras o menos.', score: null },
        { label: '3 Promesas de Marca y los correspondientes KPIs reportados semanalmente.', score: null },
        { label: 'Elevator Pitch: una respuesta convincente a la pregunta "A que se dedica su empresa?"', score: null },
      ],
    },
    {
      id: 9,
      name: 'Todos los empleados pueden responder cuantitativamente si tuvieron un buen dia o una buena semana (COL. 7 OPSP).',
      habits: [
        { label: '1 o 2 Indicadores Clave de Rendimiento (KPIs) son reportados semanalmente para cada rol/persona.', score: null },
        { label: 'Cada empleado tiene 1 Numero Critico que se alinea con el Numero Critico Trimestral de la empresa.', score: null },
        { label: 'Cada individuo/equipo tiene 3-5 prioridades/rocas trimestrales que se alinean con las de la compania.', score: null },
        { label: 'Gerentes y mandos medios tienen un coach (o colega) acompanandolos y le rinden cuentas de los cambios de comportamiento.', score: null },
      ],
    },
    {
      id: 10,
      name: 'Los planes y el desempeno de la compania estan a la vista de todos.',
      habits: [
        { label: 'Hay una sala habilitada para las reuniones semanales (fisica o virtual).', score: null },
        { label: 'Los Valores, el Proposito y las Prioridades se publican en toda la empresa.', score: null },
        { label: 'Los tableros-marcadores estan en todas partes mostrando el avance de los KPIs y Numeros Criticos.', score: null },
        { label: 'Existe un sistema para el seguimiento y la gestion de las Prioridades y los KPIs en cascada.', score: null },
      ],
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private ejecucionService: EjecucionService
  ) {
    this.hash = this.route.snapshot.paramMap.get('hash') || '';
    const idCompany = Number(this.route.snapshot.queryParamMap.get('id_company'));
    const idEntity = Number(this.route.snapshot.queryParamMap.get('id_entity'));
    const idCampaign = Number(this.hash);

    this.idCompany = Number.isFinite(idCompany) ? idCompany : null;
    this.idEntity = Number.isFinite(idEntity) ? idEntity : null;
    this.idCampaign = Number.isFinite(idCampaign) ? idCampaign : null;
  }

  ngOnInit(): void {
    void this.validateCampaignStatus();
  }

  get segmentAverages(): number[] {
    return this.segments.map((segment) => {
      const values = segment.habits.map((h) => h.score).filter((v): v is number => v !== null);
      if (!values.length) return 0;
      const total = values.reduce((acc, n) => acc + n, 0);
      return Number((total / values.length).toFixed(2));
    });
  }

  get totalAverage(): number {
    const values = this.segmentAverages.filter((x) => x > 0);
    if (!values.length) return 0;
    const total = values.reduce((acc, n) => acc + n, 0);
    return Number((total / values.length).toFixed(2));
  }

  selectScore(segmentIndex: number, habitIndex: number, score: number): void {
    if (!this.isCampaignActive) return;
    this.segments[segmentIndex].habits[habitIndex].score = score;
  }

  async enviarEncuesta(): Promise<void> {
    if (!this.idCampaign) {
      await Swal.fire('Error', 'La URL de la encuesta no es valida.', 'error');
      return;
    }

    const campaignIsActive = await this.validateCampaignStatus();
    if (!campaignIsActive) {
      await Swal.fire('Encuesta no disponible', 'Esta encuesta ya no se encuentra activa.', 'warning');
      return;
    }

    const unanswered = this.segments.some((s) => s.habits.some((h) => h.score === null));
    if (unanswered) {
      await Swal.fire('Incompleta', 'Responde los 40 habitos antes de enviar.', 'warning');
      return;
    }

    if (!this.idCompany || !this.idEntity || !this.idCampaign) {
      await Swal.fire('Error', 'La URL de la encuesta no es valida.', 'error');
      return;
    }

    this.sending = true;
    try {
      const payload = this.segments.reduce((acc, segment) => {
        acc[`segment_${segment.id}`] = [
          {
            value_1: Number(segment.habits[0].score),
            value_2: Number(segment.habits[1].score),
            value_3: Number(segment.habits[2].score),
            value_4: Number(segment.habits[3].score),
          },
        ];
        return acc;
      }, {
        id_company: this.idCompany,
        id_entity: this.idEntity,
        id_campaign: this.idCampaign,
      } as any);

      await this.ejecucionService.createSurveyAnswer(payload);
      await Swal.fire('Enviada', 'Gracias por completar la encuesta.', 'success');
    } finally {
      this.sending = false;
    }
  }

  private async validateCampaignStatus(): Promise<boolean> {
    if (!this.idCampaign) {
      this.isCampaignActive = false;
      return false;
    }

    try {
      const resp = await this.ejecucionService.getSurveyCampaignById(this.idCampaign);
      this.isCampaignActive = Number(resp?.data?.status ?? 0) === 1;
      return this.isCampaignActive;
    } catch {
      this.isCampaignActive = false;
      return false;
    }
  }
}
