import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StageItem {
  idea: string;
  reduction: string;
  errors: string;
  gap: string;
}

interface Stage {
  letter: string;
  title: string;
  editing: boolean;
  items: StageItem[];
}

@Component({
  selector: 'app-optcash',
  imports: [CommonModule, FormsModule],
  templateUrl: './optcash.component.html',
  styleUrl: './optcash.component.scss'
})
export class OptcashComponent {
  stages: Stage[] = [
    {
      letter: 'A',
      title: 'Ideas para mejorar el Ciclo de Ventas',
      editing: false,
      items: Array(1).fill(null).map(() => this.createItem()),
    },
    {
      letter: 'B',
      title: 'Ideas para mejorar el Ciclo de Manufactura/Producción e Inventario',
      editing: false,
      items: Array(1).fill(null).map(() => this.createItem()),
    },
    {
      letter: 'C',
      title: 'Ideas para mejorar el Ciclo de Entrega/Distribución',
      editing: false,
      items: Array(1).fill(null).map(() => this.createItem()),
    },
    {
      letter: 'D',
      title: 'Ideas para mejorar el Ciclo de Facturación y Cobro',
      editing: false,
      items: Array(1).fill(null).map(() => this.createItem()),
    }
  ];

  createItem(): StageItem {
    return {
      idea: '',
      reduction: '',
      errors: '',
      gap: ''
    };
  }

  addItem(stageIndex: number): void {
    this.stages[stageIndex].items.push(this.createItem());
  }

  removeItem(stageIndex: number, itemIndex: number): void {
    this.stages[stageIndex].items.splice(itemIndex, 1);
  }

  toggleEdit(index: number): void {
    this.stages[index].editing = !this.stages[index].editing;
  }

  getInputWidth(text: string): number {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.fontWeight = '600';
    span.style.fontSize = '1rem';
    span.innerText = text || '';
    document.body.appendChild(span);
    const width = span.offsetWidth + 20;
    document.body.removeChild(span);
    return width;
  }

  save(): void {
    console.log('Data guardada:', this.stages);
  }
}
