import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { EjecucionService } from '../../../services/ejecucion.service';

interface FaceKpi {
    kpi: string;
}

interface FaceResult {
    result: string;
}

interface FaceItem {
    id?: number;
    function_name: string;
    accountable_name: string;
    kpi_list: FaceKpi[];
    results_list: FaceResult[];
    status?: number;
    created_by?: string;
}

@Component({
    selector: 'app-face',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './face.component.html',
    styleUrl: './face.component.scss',
})
export class FaceComponent implements OnInit {
    funciones: FaceItem[] = [];
    readonly id_company = environment.defaultCompanyId || 'Scalingsoft';
    readonly id_entity = environment.defaultEntityId;
    readonly requester_user_id = '13474';
    readonly default_created_by = environment.defaultCreatedBy;
    loading = false;
    savingId: number | null = null;

    constructor(private ejecucionService: EjecucionService) {}

    ngOnInit(): void {
        this.addFuncion();
        this.loadFace();
    }

    private mapFromApi(row: any): FaceItem {
        return {
            id: row?.id,
            function_name: row?.function_name || '',
            accountable_name: row?.accountable_name || '',
            kpi_list: Array.isArray(row?.kpi_list)
                ? row.kpi_list.map((k: any) => ({
                      kpi: k?.kpi || '',
                  }))
                : [],
            results_list: Array.isArray(row?.results_list)
                ? row.results_list.map((r: any) => ({
                      result: r?.result ?? '',
                  }))
                : [],
            status: row?.status ?? 1,
            created_by: String(row?.created_by ?? this.default_created_by),
        };
    }

    async loadFace(): Promise<void> {
        this.loading = true;
        try {
            const resp = await this.ejecucionService.getFaceVisible({
                id_company: this.id_company,
                requester_user_id: this.requester_user_id,
            });
            const data = resp?.data;
            if (Array.isArray(data) && data.length) {
                this.funciones = data.map((row) => this.mapFromApi(row));
            }
        } catch (error) {
            console.error('Error cargando FACE', error);
            Swal.fire('Error', 'No se pudo cargar FACE. Intenta de nuevo.', 'error');
        } finally {
            this.loading = false;
        }
    }

    addFuncion(): void {
        this.funciones.push({
            function_name: '',
            accountable_name: '',
            kpi_list: [],
            results_list: [],
            status: 1,
            created_by: String(this.default_created_by),
        });
    }

    addKpi(i: number, event: KeyboardEvent): void {
        const input = event.target as HTMLInputElement;
        const name = (input.value || '').trim();
        if (!name) return;
        this.funciones[i].kpi_list.push({ kpi: name });
        input.value = '';
    }

    removeKpi(i: number, ki: number): void {
        this.funciones[i].kpi_list.splice(ki, 1);
    }

    addResultado(i: number, event: KeyboardEvent): void {
        const input = event.target as HTMLInputElement;
        const valueStr = (input.value || '').trim();
        if (!valueStr) return;
        this.funciones[i].results_list.push({ result: valueStr });
        input.value = '';
    }

    removeResultado(i: number, ri: number): void {
        this.funciones[i].results_list.splice(ri, 1);
    }

    chipColor(idx: number): string {
        const palette = [
            'bg-blue-500',
            'bg-green-500',
            'bg-amber-400',
            'bg-violet-500',
            'bg-cyan-600',
            'bg-rose-500',
        ];
        return palette[idx % palette.length];
    }

    private buildPayloadCreate(item: FaceItem) {
        return {
            id_company: this.id_company,
            id_entity: this.id_entity,
            function_name: (item.function_name || '').trim(),
            accountable_name: (item.accountable_name || '').trim(),
            kpi_list: item.kpi_list
                .map((k) => ({
                    kpi: (k.kpi || '').trim(),
                }))
                .filter((k) => k.kpi),
            results_list: item.results_list
                .map((r) => ({
                    result: r.result,
                }))
                .filter((r) => r.result !== undefined && r.result !== null && `${r.result}`.trim() !== ''),
            status: item.status ?? 1,
            created_by: String(item.created_by ?? this.default_created_by),
        };
    }

    private buildPayloadUpdate(item: FaceItem) {
        return {
            function_name: (item.function_name || '').trim(),
            accountable_name: (item.accountable_name || '').trim(),
            kpi_list: item.kpi_list
                .map((k) => ({
                    kpi: (k.kpi || '').trim(),
                }))
                .filter((k) => k.kpi),
            results_list: item.results_list
                .map((r) => ({
                    result: r.result,
                }))
                .filter((r) => r.result !== undefined && r.result !== null && `${r.result}`.trim() !== ''),
            status: item.status ?? 1,
            created_by: String(item.created_by ?? this.default_created_by),
        };
    }

    private validateItem(item: FaceItem): boolean {
        if (!item.function_name.trim() || !item.accountable_name.trim()) {
            Swal.fire('Campos incompletos', 'Función y accountable son obligatorios.', 'warning');
            return false;
        }
        if (!item.kpi_list.length) {
            Swal.fire('Campos incompletos', 'Agrega al menos un KPI.', 'warning');
            return false;
        }
        if (!item.results_list.length) {
            Swal.fire('Campos incompletos', 'Agrega al menos un resultado.', 'warning');
            return false;
        }
        return true;
    }

    async guardarNuevos(): Promise<void> {
        const nuevos = this.funciones.filter((f) => !f.id);
        const existentes = this.funciones.filter((f) => f.id);

        if (!nuevos.length && !existentes.length) {
            Swal.fire('Sin registros', 'No hay registros para guardar.', 'info');
            return;
        }

        for (const item of [...nuevos, ...existentes]) {
            if (!this.validateItem(item)) return;
        }

        try {
            if (nuevos.length) {
                const items = nuevos.map((f) => this.buildPayloadCreate(f));
                await this.ejecucionService.createFace({ items });
            }

            for (const item of existentes) {
                await this.ejecucionService.updateFace(item.id!, this.buildPayloadUpdate(item));
            }

            Swal.fire('Guardado', 'FACE actualizado correctamente.', 'success');
            await this.loadFace();
        } catch (error) {
            console.error('Error guardando FACE', error);
            Swal.fire('Error', 'No se pudo guardar FACE. Intenta nuevamente.', 'error');
        }
    }

    async guardarFila(index: number): Promise<void> {
        const item = this.funciones[index];
        if (!item.id) {
            Swal.fire('Registro nuevo', 'Este registro es nuevo. Usa "Crear nuevos".', 'info');
            return;
        }
        if (!this.validateItem(item)) return;
        this.savingId = item.id;
        try {
            const payload = this.buildPayloadUpdate(item);
            await this.ejecucionService.updateFace(item.id, payload);
            Swal.fire('Actualizado', 'FACE actualizado.', 'success');
            await this.loadFace();
        } catch (error) {
            console.error('Error actualizando FACE', error);
            Swal.fire('Error', 'No se pudo actualizar FACE.', 'error');
        } finally {
            this.savingId = null;
        }
    }

    async eliminarFila(index: number): Promise<void> {
        const item = this.funciones[index];
        if (!item.id) {
            this.funciones.splice(index, 1);
            if (!this.funciones.length) this.addFuncion();
            return;
        }
        const confirm = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar registro?',
            text: 'Esta acción eliminará el registro de FACE.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
        });
        if (!confirm.isConfirmed) return;
        this.savingId = item.id;
        try {
            await this.ejecucionService.deleteFace(item.id);
            Swal.fire('Eliminado', 'Registro eliminado.', 'success');
            await this.loadFace();
        } catch (error) {
            console.error('Error eliminando FACE', error);
            Swal.fire('Error', 'No se pudo eliminar.', 'error');
        } finally {
            this.savingId = null;
        }
    }
}
