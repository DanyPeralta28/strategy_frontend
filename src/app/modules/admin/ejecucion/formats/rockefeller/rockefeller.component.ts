import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EjecucionService } from '../../../services/ejecucion.service';
import Swal from 'sweetalert2';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

interface HabitSegment {
  id: number;
  name: string;
  habits: string[];
}

interface SessionLog {
  campaignName: string;
  createdAt: string;
  dateKey: string;
  responses: number;
  globalAverage: number;
}

interface SessionLogView extends SessionLog {
  displayLabel: string;
}

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

@Component({
  selector: 'app-rockefeller',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PermissionEditLockDirective],
  templateUrl: './rockefeller.component.html',
  styleUrl: './rockefeller.component.scss'
})
export class RockefellerComponent implements OnInit, OnDestroy {
  readonly segments: HabitSegment[] = [
    {
      id: 1,
      name: 'El equipo directivo esta alineado y tiene una dinamica saludable.',
      habits: [
        'Los integrantes del equipo comprenden las diferencias, prioridades y estilos de cada uno.',
        'El equipo se reune frecuentemente para pensar en la estrategia (idealmente una vez por semana).',
        'El equipo dedica tiempo para formacion empresarial (recomendado mensualmente).',
        'El equipo puede participar en debates constructivos y todos los integrantes se sienten comodos participando.',
      ],
    },
    {
      id: 2,
      name: 'Todos estan alineados con la prioridad #1 que se debe lograr este trimestre para que la compania avance.',
      habits: [
        'Esta identificado el Numero Critico trimestral para que la compania avance.',
        'Estan identificadas y ordenadas las 3-5 Prioridades que soportan el Numero Critico trimestral.',
        'Estan anunciados el tema trimestral y la celebracion/recompensa a todos los empleados que dan vida al Numero Critico.',
        'Se comunica semanalmente a los empleados el progreso del tema trimestral y el Numero Critico.',
      ],
    },
    {
      id: 3,
      name: 'Esta establecido un ritmo de comunicacion y la informacion se traslada a la organizacion de forma clara y rapida.',
      habits: [
        'Todos los empleados participan en una reunion diaria que dura menos de 15 minutos.',
        'Todos los equipos tienen una reunion semanal.',
        'Gerentes y mandos medios se reunen un dia al mes para aprendizaje, solucionar temas importantes y transferencia de ADN.',
        'Gerentes y mandos medios se reunen fuera de la oficina de forma trimestral y anual para trabajar en las 4 Decisiones.',
      ],
    },
    {
      id: 4,
      name: 'Cada tarea en la organizacion esta asignada a una persona que rinde cuentas de la consecucion de los objetivos.',
      habits: [
        'El cuadro de Funciones y Responsabilidad esta completo (personas correctas, en el lugar correcto, haciendo las cosas correctas).',
        'Hay una persona asignada para cada una de las lineas de los estados financieros.',
        'Hay una persona que rinde cuentas de cada uno de los procesos descritos en el Cuadro de Procesos y Responsabilidad.',
        'Para cada una de las capacidades clave a 3-5 anos, hay un experto interno o en el Consejo de Administracion.',
      ],
    },
    {
      id: 5,
      name: 'Se recogen las sugerencias de los empleados para identificar problemas y oportunidades.',
      habits: [
        'Gerentes y mandos medios tienen una conversacion empezar/parar/continuar con al menos un empleado a la semana.',
        'Las ideas surgidas de las conversaciones con los empleados son compartidas en la reunion semanal del equipo gerencial.',
        'Las aportaciones del empleado acerca de los problemas y oportunidades se recogen semanalmente.',
        'Los mandos medios son responsables del proceso de cerrar el circulo de todos los problemas y oportunidades.',
      ],
    },
    {
      id: 6,
      name: 'El reporte y analisis de los comentarios del cliente son tan frecuentes y precisos como los datos financieros.',
      habits: [
        'Gerentes y mandos medios tienen una conversacion 4Q con un cliente final al menos una vez a la semana.',
        'Las conclusiones de las conversaciones con los clientes son compartidas en la reunion semanal del equipo gerencial.',
        'Todos los empleados estan involucrados en la recoleccion de datos de los clientes.',
        'Los mandos medios son responsables del proceso de cerrar el circulo de todos los comentarios/quejas de los clientes.',
      ],
    },
    {
      id: 7,
      name: 'Los Valores y el Proposito se viven dentro de la organizacion.',
      habits: [
        'Los Valores y el Proposito estan definidos claramente y ambos son conocidos por todos los empleados.',
        'Gerentes y mandos medios se refieren a los Valores y el Proposito cuando premian o reganan.',
        'Los procesos y actividades de RRHH se alinean con los Valores y el Proposito (contratacion, orientacion, evaluacion, reconocimiento, etc.).',
        'Cada trimestre se identifican e implementan acciones que refuercen los Valores y Proposito en la organizacion.',
      ],
    },
    {
      id: 8,
      name: 'Los empleados pueden explicar, con seguridad, los componentes clave de la estrategia de la compania.',
      habits: [
        'El objetivo grande, peludo y audaz (BHAG): el progreso es rastreado y visible.',
        'Cliente(s) Principal(es): su perfil en 25 palabras o menos.',
        '3 Promesas de Marca y los correspondientes KPIs reportados semanalmente.',
        'Elevator Pitch: una respuesta convincente a la pregunta "A que se dedica su empresa?"',
      ],
    },
    {
      id: 9,
      name: 'Todos los empleados pueden responder cuantitativamente si tuvieron un buen dia o una buena semana (COL. 7 OPSP).',
      habits: [
        '1 o 2 Indicadores Clave de Rendimiento (KPIs) son reportados semanalmente para cada rol/persona.',
        'Cada empleado tiene 1 Numero Critico que se alinea con el Numero Critico Trimestral de la empresa.',
        'Cada individuo/equipo tiene 3-5 prioridades/rocas trimestrales que se alinean con las de la compania.',
        'Gerentes y mandos medios tienen un coach (o colega) acompanandolos y le rinden cuentas de los cambios de comportamiento.',
      ],
    },
    {
      id: 10,
      name: 'Los planes y el desempeno de la compania estan a la vista de todos.',
      habits: [
        'Hay una sala habilitada para las reuniones semanales (fisica o virtual).',
        'Los Valores, el Proposito y las Prioridades se publican en toda la empresa.',
        'Los tableros-marcadores estan en todas partes mostrando el avance de los KPIs y Numeros Criticos.',
        'Existe un sistema para el seguimiento y la gestion de las Prioridades y los KPIs en cascada.',
      ],
    },
  ];

  isSessionActive = false;
  activeCampaignId: number | null = null;
  campaignName = '';
  sessionHash = '';
  sessionLink = '';
  qrImageUrl = '';
  qrSize = 21;
  qrMatrix: boolean[][] = [];
  responsesCount = 0;
  segmentAverages: number[] = Array.from({ length: 10 }, () => 0);
  globalAverage = 0;
  lastRefreshAt = '';
  sessionStartedAt = '';
  selectedLogDate = '';

  private pollerId: ReturnType<typeof setInterval> | null = null;
  private readonly idCompany = getSessionCompanyId();
  private readonly idEntity = getSessionEntityId();
  private readonly userId = getSessionUserId();

  sessionLog: SessionLog[] = [];

  get segmentCount(): number {
    return this.segments.length;
  }

  get habitCount(): number {
    return this.segmentCount * 4;
  }

  get logsForSelectedDate(): SessionLogView[] {
    return this.buildLogView().filter((x) => x.dateKey === this.selectedLogDate);
  }

  get allLogs(): SessionLogView[] {
    return this.buildLogView();
  }

  constructor(private ejecucionService: EjecucionService) {}

  ngOnInit(): void {
    void this.loadActiveCampaign();
  }

  iniciarEncuesta(): void {
    void Swal.fire({
      title: 'Iniciar sesion',
      input: 'text',
      inputLabel: 'Nombre de la sesion',
      inputPlaceholder: 'Ej. GRUPO DE LAS 10 AM',
      showCancelButton: true,
      confirmButtonText: 'Iniciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#003660',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Debes ingresar el nombre de la sesion.';
        }
        return null;
      },
    }).then(async (result) => {
      const campaignName = String(result.value ?? '').trim();
      if (!result.isConfirmed || !campaignName) return;

      try {
        await this.ejecucionService.createSurveyCampaign({
          campaign_name: campaignName,
          id_company: this.idCompany,
          created_by: this.userId,
          id_entity: this.idEntity,
        });

        await this.loadActiveCampaign();

        await Swal.fire({
          icon: 'success',
          title: 'Sesion iniciada',
          text: 'La campana fue creada correctamente.',
          confirmButtonColor: '#003660',
        });
      } catch (error: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error?.message || 'No se pudo iniciar la sesion.',
          confirmButtonColor: '#003660',
        });
      }
    });
  }

  finalizarEncuesta(): void {
    if (!this.activeCampaignId) return;

    void Swal.fire({
      title: 'Finalizar sesion',
      text: 'Esta accion marcara la encuesta activa como finalizada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Finalizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#003660',
    }).then(async (result) => {
      if (!result.isConfirmed || !this.activeCampaignId) return;

      try {
        await this.ejecucionService.updateSurveyCampaign(this.activeCampaignId, {
          status: 2,
        });

        this.isSessionActive = false;
        this.activeCampaignId = null;
        this.campaignName = '';
        this.sessionHash = '';
        this.sessionLink = '';
        this.qrImageUrl = '';
        this.responsesCount = 0;
        this.segmentAverages = this.segments.map(() => 0);
        this.globalAverage = 0;
        this.lastRefreshAt = '';
        this.sessionStartedAt = '';
        this.stopMockPolling();

        await Swal.fire({
          icon: 'success',
          title: 'Sesion finalizada',
          text: 'La campaña activa fue finalizada correctamente.',
          confirmButtonColor: '#003660',
        });
      } catch (error: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error?.message || 'No se pudo finalizar la sesion.',
          confirmButtonColor: '#003660',
        });
      }
    });
  }

  filtrarBitacora(): void {
    if (!this.selectedLogDate) {
      this.sessionLog = [];
      return;
    }

    void this.loadCampaignLogByDate(this.selectedLogDate);
  }

  clearDateFilter(): void {
    this.selectedLogDate = '';
    this.sessionLog = [];
  }

  qrCells(): { row: number; col: number; on: boolean }[] {
    const cells: { row: number; col: number; on: boolean }[] = [];
    for (let r = 0; r < this.qrMatrix.length; r++) {
      for (let c = 0; c < this.qrMatrix[r].length; c++) {
        cells.push({ row: r, col: c, on: this.qrMatrix[r][c] });
      }
    }
    return cells;
  }

  segmentBar(score: number): number {
    return Math.max(0, Math.min(100, (score / 10) * 100));
  }

  ngOnDestroy(): void {
    this.stopMockPolling();
  }

  private async loadActiveCampaign(): Promise<void> {
    try {
      const resp = await this.ejecucionService.getActiveSurveyCampaignByUser(
        this.userId,
        this.idCompany,
        this.idEntity
      );
      const data = resp?.data;

      if (!data?.hasActive || !data?.campaign?.id) {
        this.isSessionActive = false;
        this.activeCampaignId = null;
        this.campaignName = '';
        this.responsesCount = 0;
        this.globalAverage = 0;
        this.segmentAverages = this.segments.map(() => 0);
        this.sessionStartedAt = '';
        this.sessionLink = '';
        this.qrImageUrl = '';
        this.stopMockPolling();
        return;
      }

      this.isSessionActive = true;
      this.activeCampaignId = Number(data.campaign.id);
      this.campaignName = (data.campaign.campaign_name ?? '').toString().trim();
      this.sessionStartedAt = (data.campaign.created_at ?? '').toString().trim();
      this.sessionHash = String(this.activeCampaignId);
      this.sessionLink = this.buildPublicSurveyLink(this.activeCampaignId);
      this.qrImageUrl = this.buildQrImageUrl(this.sessionLink);
      this.qrMatrix = this.generateQrMatrix(this.sessionLink, this.qrSize);
      await this.loadCampaignDetail(this.activeCampaignId);
      this.startCampaignPolling();
    } catch (error) {
      console.error('Error cargando campaña activa de Rockefeller:', error);
      this.isSessionActive = false;
      this.stopMockPolling();
    }
  }

  private async loadCampaignDetail(campaignId: number): Promise<void> {
    try {
      const resp = await this.ejecucionService.getSurveyCampaignById(campaignId);
      const campaign = resp?.data;
      if (!campaign) return;

      this.responsesCount = Number(campaign?.total_answers ?? 0);
      this.globalAverage = Number(campaign?.averages?.avg_total ?? 0);
      this.segmentAverages = this.segments.map((segment) =>
        Number(campaign?.averages?.[`avg_segment_${segment.id}`] ?? 0)
      );
      this.lastRefreshAt = this.nowLabel();
      if (campaign?.campaign_name != null && String(campaign.campaign_name).trim()) {
        this.campaignName = String(campaign.campaign_name).trim();
      }
      if (campaign?.created_at) {
        this.sessionStartedAt = String(campaign.created_at).trim();
      }
    } catch (error) {
      console.error('Error cargando detalle de campaña Rockefeller:', error);
    }
  }

  private async loadCampaignLogByDate(date: string): Promise<void> {
    try {
      const resp = await this.ejecucionService.getSurveyCampaignsByCompany(
        this.idCompany,
        String(this.userId),
        date
      );

      const campaigns = Array.isArray(resp?.data) ? resp.data : [];
      this.sessionLog = campaigns.map((campaign: any) => ({
        campaignName: String(campaign?.campaign_name ?? '').trim(),
        createdAt: String(campaign?.created_at ?? ''),
        dateKey: this.extractDateKey(String(campaign?.created_at ?? ''), date),
        responses: Number(campaign?.total_answers ?? 0),
        globalAverage: Number(campaign?.avg_total ?? 0),
      }));
    } catch (error) {
      console.error('Error cargando bitacora de campanas Rockefeller:', error);
      this.sessionLog = [];
    }
  }

  private startCampaignPolling(): void {
    this.stopMockPolling();
    this.pollerId = setInterval(() => {
      if (!this.isSessionActive || !this.activeCampaignId) return;
      void this.loadCampaignDetail(this.activeCampaignId);
    }, 5000);
  }

  private stopMockPolling(): void {
    if (this.pollerId) {
      clearInterval(this.pollerId);
      this.pollerId = null;
    }
  }

  private recomputeGlobalAverage(): void {
    const total = this.segmentAverages.reduce((acc, x) => acc + x, 0);
    this.globalAverage = Number((total / this.segmentAverages.length).toFixed(2));
  }

  private refreshLastUpdated(): void {
    this.lastRefreshAt = this.nowLabel();
  }

  private nowLabel(): string {
    return new Date().toLocaleString('es-GT', { hour12: false });
  }

  private randomScore(): number {
    return Number((6 + Math.random() * 3.5).toFixed(1));
  }

  private buildPublicSurveyLink(campaignId: number): string {
    const origin = globalThis?.location?.origin || 'https://dominio';
    return `${origin}/encuesta/${campaignId}?id_company=${this.idCompany}&id_entity=${this.idEntity}`;
  }

  private buildQrImageUrl(link: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
  }

  private generateQrMatrix(source: string, size: number): boolean[][] {
    const chars = Array.from(source).map((x) => x.charCodeAt(0));
    const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const idx = (r * size + c) % chars.length;
        const seed = chars[idx] + r * 17 + c * 31;
        matrix[r][c] = seed % 2 === 0;
      }
    }

    // Corners similar to finder blocks for visual QR style.
    this.paintFinder(matrix, 0, 0);
    this.paintFinder(matrix, 0, size - 7);
    this.paintFinder(matrix, size - 7, 0);
    return matrix;
  }

  private paintFinder(matrix: boolean[][], startRow: number, startCol: number): void {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const onEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startRow + r][startCol + c] = onEdge || inner;
      }
    }
  }

  private buildLogView(): SessionLogView[] {
    const map: Record<string, number> = {};
    return this.sessionLog.map((log) => {
      const dateKey = log.dateKey;
      map[dateKey] = (map[dateKey] || 0) + 1;
      const labelDate = this.formatDateKey(dateKey);
      return {
        ...log,
        displayLabel: `${labelDate} ${map[dateKey]}`,
      };
    });
  }

  private extractDateKey(createdAt: string, fallback: string): string {
    const match = createdAt.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return fallback;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  private formatDateKey(dateKey: string): string {
    const [year, month, day] = dateKey.split('-');
    if (!year || !month || !day) return dateKey;
    return `${Number(day)}/${Number(month)}/${year}`;
  }

}
