import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ValueArea {
  label: string;
  rating: 'Ninguno' | 'Débil' | 'Sólido' | 'Excepcional' | null;
}

interface Priority {
  name: string;
  create: string;
  improve: string;
}

@Component({
  selector: 'app-value',
  imports: [CommonModule, FormsModule],
  templateUrl: './value.component.html',
  styleUrl: './value.component.scss'
})
export class ValueComponent {
  areas: ValueArea[] = [
    { label: 'Contratos a Largo plazo', rating: null },
    { label: 'Suscripciones Inscripciones auto renovables', rating: null },
    { label: 'Suscripciones como Inversiones en aumento de Capital', rating: null },
    { label: 'Suscripciones', rating: null },
    { label: 'Inversiones de Capital para consumibles', rating: null },
    { label: 'Consumibles', rating: null }
  ];

  priorities: Priority[] = [
    { name: '', create: '', improve: '' }
  ];

  addPriority(): void {
    if (this.priorities.length < 3) {
      this.priorities.push({ name: '', create: '', improve: '' });
    }
  }

  removePriority(index: number): void {
    if (this.priorities.length > 1) {
      this.priorities.splice(index, 1);
    }
  }

  save(): void {
    console.log('Valoraciones guardadas:', this.areas);
    // Aquí podrías agregar la lógica para enviar a un servicio o backend si lo necesitas
  }

}
