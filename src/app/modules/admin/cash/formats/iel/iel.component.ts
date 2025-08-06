import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Period {
  year: string;
  revenue: number | null;
  cogs: number | null;
  grossMargin: number | null;
  directLabor: number | null;
}

interface ImpactItem {
  label: string;
  rank: number | null;
}

@Component({
  selector: 'app-iel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iel.component.html',
  styleUrls: ['./iel.component.scss']
})
export class IelComponent {
  periods: Period[] = [
    { year: '', revenue: null, cogs: null, grossMargin: null, directLabor: null }
  ];

  // Aquí definimos los 3 ítems de impacto:
  impactItems: ImpactItem[] = [
    {
      label: 'Incremento (%) de integrantes tipo “A” (del Equipo con Talento)',
      rank: null
    },
    {
      label: 'Fortalecer las disciplinas de Ejecución (Prioridades, Métricas, Comunicación)',
      rank: null
    },
    {
      label: 'Optimizar el Desempeño del Producto (Perfeccionar la Promesa de Marca / Indicadores clave de rendimiento)',
      rank: null
    }
  ];

  addPeriod(): void {
    this.periods.push({ year: '', revenue: null, cogs: null, grossMargin: null, directLabor: null });
  }

  removePeriod(i: number): void {
    if (this.periods.length > 1) {
      this.periods.splice(i, 1);
    }
  }

  getIel(period: Period): number {
    if (period.grossMargin != null && period.directLabor != null && period.directLabor !== 0) {
      return period.grossMargin / period.directLabor;
    }
    return 0;
  }

  save(): void {
    const data = {
      periods: this.periods,
      impactItems: this.impactItems
    };

    console.log('Datos guardados:', data);

  }
}
