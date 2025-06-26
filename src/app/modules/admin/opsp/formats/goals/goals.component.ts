import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

interface GoalField {
  title: string;
  value: string;
  editing?: boolean;
}
interface GoalSection {
  key: string;
  title: string;
  range?: string;
  values: GoalField[];
}

@Component({
  selector: 'app-goals',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent {
  goalData: Record<string, GoalSection> = {
    threeFiveYears: {
      key: 'threeFiveYears',
      title: '3–5 Años',
      values: [{ title: 'Año tributario', value: '2025' }]
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

  /** Guardar (solo demo) */
  save(): void {
    console.log('Goal data:', this.goalData);
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Las metas se guardaron correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}
