import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { EjecucionService } from '../../../services/ejecucion.service';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

interface PaceKpi {
    kpi: string;
}

interface PaceItem {
    id?: number;
    process_name: string;
    person_in_charge_name: string;
    kpi_list: PaceKpi[];
    status?: number;
    created_by?: string;
}

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
    selector: 'app-pace',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
    templateUrl: './pace.component.html',
    styleUrl: './pace.component.scss',
})
export class PaceComponent implements OnInit {
    items: PaceItem[] = [];
    readonly id_company = getSessionCompanyId();
    readonly requester_user_id = String(getSessionUserId());
    readonly id_entity = getSessionEntityId();
    readonly default_created_by = getSessionUserId();
    loading = false;
    savingId: number | null = null;

    constructor(private ejecucionService: EjecucionService) {}

    ngOnInit(): void {
        this.addItem();
        this.loadPace();
    }

    private mapFromApi(row: any): PaceItem {
        return {
            id: row?.id,
            process_name: row?.process_name || '',
            person_in_charge_name: row?.person_in_charge_name || '',
            kpi_list: Array.isArray(row?.kpi_list)
                ? row.kpi_list.map((k: any) => ({
                      kpi: k?.kpi || '',
                  }))
                : [],
            status: row?.status ?? 1,
            created_by: String(row?.created_by ?? this.default_created_by),
        };
    }

    async loadPace(): Promise<void> {
        this.loading = true;
        try {
            const resp = await this.ejecucionService.getPaceVisible({
                id_company: this.id_company,
                requester_user_id: this.requester_user_id,
                id_entity: this.id_entity,
            });
            const data = resp?.data;
            if (Array.isArray(data) && data.length) {
                this.items = data.map((row) => this.mapFromApi(row));
            }
        } catch (error) {
            console.error('Error cargando PACE', error);
            Swal.fire('Error', 'No se pudo cargar PACE. Intenta de nuevo.', 'error');
        } finally {
            this.loading = false;
        }
    }

    addItem(): void {
        this.items.push({
            process_name: '',
            person_in_charge_name: '',
            kpi_list: [],
            status: 1,
            created_by: String(this.default_created_by),
        });
    }

    addKpi(i: number, event: KeyboardEvent): void {
        const input = event.target as HTMLInputElement;
        const value = (input.value || '').trim();
        if (!value) return;
        this.items[i].kpi_list.push({ kpi: value });
        input.value = '';
    }

    removeKpi(i: number, kIndex: number): void {
        this.items[i].kpi_list.splice(kIndex, 1);
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

    private buildPayloadCreate(item: PaceItem) {
        return {
            id_company: this.id_company,
            id_entity: this.id_entity,
            process_name: (item.process_name || '').trim(),
            person_in_charge_name: (item.person_in_charge_name || '').trim(),
            kpi_list: item.kpi_list
                .map((k) => ({
                    kpi: (k.kpi || '').trim(),
                }))
                .filter((k) => k.kpi),
            status: item.status ?? 1,
            created_by: String(item.created_by ?? this.default_created_by),
        };
    }

    private buildPayloadUpdate(item: PaceItem) {
        return {
            process_name: (item.process_name || '').trim(),
            person_in_charge_name: (item.person_in_charge_name || '').trim(),
            kpi_list: item.kpi_list
                .map((k) => ({
                    kpi: (k.kpi || '').trim(),
                }))
                .filter((k) => k.kpi),
            status: item.status ?? 1,
            created_by: String(item.created_by ?? this.default_created_by),
        };
    }

    private validateItem(item: PaceItem): boolean {
        if (!item.process_name.trim() || !item.person_in_charge_name.trim()) {
            Swal.fire('Campos incompletos', 'Proceso y responsable son obligatorios.', 'warning');
            return false;
        }
        if (!item.kpi_list.length) {
            Swal.fire('Campos incompletos', 'Agrega al menos un KPI.', 'warning');
            return false;
        }
        return true;
    }

    async guardarNuevos(): Promise<void> {
        const nuevos = this.items.filter((f) => !f.id);
        if (!nuevos.length) {
            Swal.fire('Sin registros', 'No hay nuevos procesos para crear.', 'info');
            return;
        }
        for (const item of nuevos) {
            if (!this.validateItem(item)) return;
        }
        const items = nuevos.map((f) => this.buildPayloadCreate(f));
        try {
            await this.ejecucionService.createPace({ items });
            Swal.fire('Creado', 'PACE creado correctamente.', 'success');
            await this.loadPace();
        } catch (error) {
            console.error('Error creando PACE', error);
            Swal.fire('Error', 'No se pudo crear PACE. Intenta nuevamente.', 'error');
        }
    }

    async guardarFila(index: number): Promise<void> {
        const item = this.items[index];
        if (!item.id) {
            Swal.fire('Registro nuevo', 'Este registro es nuevo. Usa "Guardar FACE".', 'info');
            return;
        }
        if (!this.validateItem(item)) return;
        this.savingId = item.id;
        try {
            const payload = this.buildPayloadUpdate(item);
            await this.ejecucionService.updatePace(item.id, payload);
            Swal.fire('Actualizado', 'PACE actualizado.', 'success');
            await this.loadPace();
        } catch (error) {
            console.error('Error actualizando PACE', error);
            Swal.fire('Error', 'No se pudo actualizar PACE.', 'error');
        } finally {
            this.savingId = null;
        }
    }

    async eliminarFila(index: number): Promise<void> {
        const item = this.items[index];
        if (!item.id) {
            this.items.splice(index, 1);
            if (!this.items.length) this.addItem();
            return;
        }
        const confirm = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar registro?',
            text: 'Esta acción eliminará el registro de PACE.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
        });
        if (!confirm.isConfirmed) return;
        this.savingId = item.id;
        try {
            await this.ejecucionService.deletePace(item.id);
            Swal.fire('Eliminado', 'Registro eliminado.', 'success');
            await this.loadPace();
        } catch (error) {
            console.error('Error eliminando PACE', error);
            Swal.fire('Error', 'No se pudo eliminar.', 'error');
        } finally {
            this.savingId = null;
        }
    }
}






