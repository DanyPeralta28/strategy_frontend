import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FollowupService } from 'app/modules/admin/services/followup.service';
import { ConfiguracionService } from 'app/modules/admin/services/configuracion.service';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

@Component({
    selector: 'app-configuracion-usuarios',
    standalone: true,
    imports: [CommonModule, PermissionEditLockDirective],
    templateUrl: './usuarios.component.html',
})
export class UsuariosComponent {
    id_company = getSessionCompanyId();
    id_entity = getSessionEntityId();
    requester_user_id = getSessionUserId();

    loading = false;
    users: Array<{
        id: number | string;
        nombre: string;
        username: string;
        email: string;
        equipo: string;
        color: string;
        status_dashboard: 0 | 1;
    }> = [];

    constructor(
        private followupService: FollowupService,
        private configuracionService: ConfiguracionService
    ) {}

    ngOnInit(): void {
        this.loadUsers();
    }

    async loadUsers(): Promise<void> {
        this.loading = true;
        try {
            const teamsResp = await this.followupService.getTeamMembersByEntity(
                this.requester_user_id,
                this.id_entity,
                this.id_company
            );
            const teams = (Array.isArray(teamsResp?.data) ? teamsResp.data : [])
                .filter((x: any) => typeof x === 'string')
                .map((x: string) => x.trim())
                .filter(Boolean);

            const responses = await Promise.all(
                teams.map(team =>
                    this.followupService
                        .getTeamMembersByTeam(team, this.id_entity, this.id_company)
                        .catch(() => ({ data: [] }))
                )
            );

            const byId = new Map<string, any>();
            responses.forEach((resp, idx) => {
                const teamName = teams[idx] || '';
                const rows = Array.isArray(resp?.data) ? resp.data : [];
                rows.forEach((u: any) => {
                    const id = u?.id_user ?? u?.user_id ?? u?.id;
                    if (id == null) return;
                    const key = String(id);
                    if (!byId.has(key)) {
                        const first = (u?.firstname ?? '').toString().trim();
                        const last = (u?.lastname ?? '').toString().trim();
                        const nombre = `${first} ${last}`.trim() || (u?.name ?? '').toString().trim();
                        byId.set(key, {
                            id,
                            nombre,
                            username: (u?.username ?? '').toString().trim(),
                            email: (u?.email ?? '').toString().trim(),
                            equipo: (u?.team ?? teamName ?? '').toString().trim(),
                            color: (u?.color ?? '#f8fafc').toString().trim() || '#f8fafc',
                            status_dashboard: Number(u?.status_dashboard) === 0 ? 0 : 1,
                        });
                    }
                });
            });

            this.users = Array.from(byId.values());
        } catch (err) {
            console.error('Error cargando usuarios para configuracion dashboard:', err);
            this.users = [];
        } finally {
            this.loading = false;
        }
    }

    async onColorChange(userId: number | string, color: string): Promise<void> {
        const previousColor = this.users.find((u) => String(u.id) === String(userId))?.color || '#f8fafc';

        try {
            await this.configuracionService.updateUserDashboardColor({
                id_user: userId,
                color,
            });

            this.users = this.users.map((user) =>
                String(user.id) === String(userId)
                    ? { ...user, color }
                    : user
            );

            await Swal.fire({
                icon: 'success',
                title: 'Color actualizado',
                text: 'El color del usuario se actualizo correctamente.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003660',
            });
        } catch (error) {
            console.error('Error actualizando color dashboard:', error);
            this.users = this.users.map((user) =>
                String(user.id) === String(userId)
                    ? { ...user, color: previousColor }
                    : user
            );
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el color del usuario.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003660',
            });
        }
    }

    async deleteFromDashboard(userId: number | string): Promise<void> {
        const r = await Swal.fire({
            icon: 'warning',
            title: 'Quitar usuario',
            html: 'Para confirmar, escribe <b>eliminar</b>.',
            input: 'text',
            inputPlaceholder: 'Escribe eliminar',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            preConfirm: (value) => {
                if ((value ?? '').toString().trim().toLowerCase() !== 'eliminar') {
                    Swal.showValidationMessage('Debes escribir la palabra eliminar.');
                    return false;
                }
                return true;
            }
        });
        if (!r.isConfirmed) return;

        try {
            await this.configuracionService.updateUserDashboardStatus({
                id_user: userId,
                status_dashboard: 0,
            });

            this.users = this.users.map((user) =>
                String(user.id) === String(userId)
                    ? { ...user, status_dashboard: 0 }
                    : user
            );

            await Swal.fire({
                icon: 'success',
                title: 'Usuario eliminado',
                text: 'El usuario se quito del dashboard correctamente.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003660',
            });
        } catch (error) {
            console.error('Error actualizando status dashboard:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el usuario del dashboard.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003660',
            });
        }
    }

    async activateOnDashboard(userId: number | string): Promise<void> {
        try {
            await this.configuracionService.updateUserDashboardStatus({
                id_user: userId,
                status_dashboard: 1,
            });

            this.users = this.users.map((user) =>
                String(user.id) === String(userId)
                    ? { ...user, status_dashboard: 1 }
                    : user
            );

            await Swal.fire({
                icon: 'success',
                title: 'Usuario activado',
                text: 'El usuario volvera a aparecer en el dashboard.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003660',
            });
        } catch (error) {
            console.error('Error activando usuario en dashboard:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo activar el usuario en el dashboard.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#003660',
            });
        }
    }
}


