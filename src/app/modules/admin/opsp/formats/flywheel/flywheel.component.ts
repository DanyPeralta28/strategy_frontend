import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-flywheel',
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule],
  templateUrl: './flywheel.component.html',
  styleUrl: './flywheel.component.scss'
})
export class FlywheelComponent {
  viewMode: 'editor' | 'circular' = 'editor';

  flywheelItems: Array<{ descripcion: string; kpi: string; responsable: string }> = [
    { descripcion: '', kpi: '', responsable: '' },
    { descripcion: '', kpi: '', responsable: '' },
    { descripcion: '', kpi: '', responsable: '' },
  ];

  agregarItem(): void {
    this.flywheelItems.push({ descripcion: '', kpi: '', responsable: '' });
  }

  eliminarItem(index: number): void {
    this.flywheelItems.splice(index, 1);
  }

  reordenar(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.flywheelItems, event.previousIndex, event.currentIndex);
  }

  guardar(): void {
    console.log('Flywheel enviado:', this.flywheelItems);
    alert('Datos enviados correctamente (ver consola)');
  }

  /* ------------ helpers para vista circular ------------- */
  private get angleStep(): number {
    return (2 * Math.PI) / this.flywheelItems.length;
  }

  getPoint(index: number, radius = 220): { x: number; y: number } {
    const angle = index * this.angleStep - Math.PI / 2;
    return {
      x: 300 + radius * Math.cos(angle), // centro en (300, 300)
      y: 300 + radius * Math.sin(angle),
    };
  }

  getBlockStyle(index: number): any {
    const { x, y } = this.getPoint(index);
    return {
      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
    };
  }

}
