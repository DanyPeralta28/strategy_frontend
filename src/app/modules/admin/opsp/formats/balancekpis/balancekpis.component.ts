import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-balancekpis',
  imports: [CommonModule, FormsModule],
  templateUrl: './balancekpis.component.html',
  styleUrl: './balancekpis.component.scss'
})
export class BalancekpisComponent {
  categorias = [
    { key: 'empleados', label: 'Empleados' },
    { key: 'clientes', label: 'Clientes' },
    { key: 'accionistas', label: 'Accionistas' },
    { key: 'entrenamiento', label: 'Entrenamiento' },
    { key: 'ventas', label: 'Ventas/Marketing' },
    { key: 'administracion', label: 'Administración' },
  ];
  fechaCumplimiento: string = '';

  kpisBalance: any = {
    empleados: [this.createKpi()],
    clientes: [this.createKpi()],
    accionistas: [this.createKpi()],
    entrenamiento: [this.createKpi()],
    ventas: [this.createKpi()],
    administracion: [this.createKpi()],
  };

  createKpi() {
    return { kpi: '', resultado: '', color: '' };
  }

  agregarKPI(key: string): void {
    this.kpisBalance[key].push({
      kpi: '',
      resultado: '',
      color: ''
    });
  }

  guardarKPIs(): void {
    const resultadoFiltrado: any = {};

    for (const key of Object.keys(this.kpisBalance)) {
      const lista = this.kpisBalance[key];

      resultadoFiltrado[key] = lista.filter(kpi =>
        kpi.kpi?.trim() !== '' || kpi.resultado?.trim() !== '' || kpi.color?.trim() !== ''
      );
    }

    const payload = {
      fechaCumplimiento: this.fechaCumplimiento,
      kpis: resultadoFiltrado
    };

    console.log('Balance de KPIs:', payload);

    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'Los datos se han registrado correctamente.',
      confirmButtonColor: '#003660'
    });
  }
}
