import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { OpspService } from '../../../services/opsp.service'; // ajusta la ruta si hace falta
import { exportSheetsToExcel } from 'app/modules/admin/utils/excel-export.util';
import { exportElementToPdf } from 'app/modules/admin/utils/pdf-export.util';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

interface GoalField {
  title: string;
  value: string;
  editing?: boolean;
}
interface GoalSection {
  key: string;
  title: string;
  values: GoalField[];
}

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
  selector: 'app-goals',
  imports: [CommonModule, FormsModule, MatIconModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  @ViewChild('pdfReportContent') pdfReportContent?: ElementRef<HTMLElement>;
  // compañía fija por ahora; podrías sacarla de contexto / ruta según tu flujo
  id_company = getSessionCompanyId();
  recordId: number | null = null; // si ya existe, se llena

  goalData: Record<string, GoalSection> = {
    threeFiveYears: {
      key: 'threeFiveYears',
      title: '3–5 Años',
      values: []
    },
    year: {
      key: 'year',
      title: '1 Año',
      values: []
    },
    trimesterOne: {
      key: 'trimesterOne',
      title: 'Trimestre 1',
      values: []
    },
    trimesterTwo: {
      key: 'trimesterTwo',
      title: 'Trimestre 2',
      values: []
    },
    trimesterThree: {
      key: 'trimesterThree',
      title: 'Trimestre 3',
      values: []
    },
    trimesterFour: {
      key: 'trimesterFour',
      title: 'Trimestre 4',
      values: []
    }
  };

  quarterKeys = ['trimesterOne', 'trimesterTwo', 'trimesterThree', 'trimesterFour'];

  constructor(private opspService: OpspService) {}

  get canExportPdf(): boolean {
    return Number(getSessionLevelUser()) === 2;
  }

  exportPdf(): void {
    void exportElementToPdf(this.pdfReportContent?.nativeElement, 'opsp_goals');
  }

  exportExcel(): void {
    const rows = Object.values(this.goalData).flatMap((section) =>
      section.values.map((item, index) => ({
        Horizonte: section.title,
        Numero: index + 1,
        Titulo: item.title.trim(),
        Valor: item.value.trim(),
      }))
    );

    void exportSheetsToExcel('opsp_goals', [
      {
        name: 'Metas',
        rows,
        widths: [18, 10, 32, 90],
      },
    ]);
  }

  ngOnInit(): void {
    this.loadGoals();
  }

  /** Alterna modo edición de la etiqueta */
  toggleEdit(sectionKey: string, index: number): void {
    const item = this.goalData[sectionKey].values[index];
    item.editing = !item.editing;
  }

  /** Agrega un nuevo campo vacío y lo pone en edición */
  addField(sectionKey: string): void {
    this.goalData[sectionKey].values.push({
      title: '',
      value: '',
      editing: true
    });
  }

  private mapBackendToUI(data: any): void {
    // Helper para transformar arrays del backend al goalData
    const mapSection = (backendArr: any[] | undefined, targetKey: string) => {
      if (Array.isArray(backendArr)) {
        this.goalData[targetKey].values = backendArr.map(item => ({
          title: item.titulo || '',
          value: item.value || '',
          editing: false
        }));
      }
    };

    mapSection(data.three_to_five_years, 'threeFiveYears');
    mapSection(data.one_year, 'year');
    mapSection(data.trimester_one, 'trimesterOne');
    mapSection(data.trimester_two, 'trimesterTwo');
    mapSection(data.trimester_three, 'trimesterThree');
    mapSection(data.trimester_four, 'trimesterFour');
  }

  private buildPayload(): any {
    const sections = [
      'threeFiveYears',
      'year',
      'trimesterOne',
      'trimesterTwo',
      'trimesterThree',
      'trimesterFour'
    ].map(key => ({
      key,
      values: this.goalData[key].values.map(f => ({
        titulo: f.title,
        value: f.value
      }))
    }));

    const payload: any = {
      created_by: getSessionUserId(), // idealmente lo tomas del contexto auténticado
      goal_sections: sections
    };

    if (!this.recordId) {
      payload.id_company = this.id_company;
    }

    return payload;
  }

  async loadGoals(): Promise<void> {
    try {
      const resp = await this.opspService.getGoalsByCompany(this.id_company);
      if (resp?.data && Array.isArray(resp.data) && resp.data.length) {
        const existing = resp.data[0];
        this.recordId = existing.id;
        this.mapBackendToUI(existing);
      }
    } catch (err) {
      console.error('Error cargando metas:', err);
    }
  }

  async save(): Promise<void> {
    const payload = this.buildPayload();

    try {
      if (this.recordId) {
        await this.opspService.updateGoal(this.recordId, payload);
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Las metas se actualizaron correctamente.',
          confirmButtonColor: '#003660'
        });
      } else {
        await this.opspService.createGoal(payload);
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'Las metas se guardaron correctamente.',
          confirmButtonColor: '#003660'
        });
        // recargar para capturar el id nuevo
        await this.loadGoals();
      }
    } catch (error) {
      console.error('Error guardando metas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar las metas. Intenta de nuevo.',
        confirmButtonColor: '#D32F2F'
      });
    }
  }
}





