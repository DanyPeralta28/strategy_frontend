import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { FollowupService } from 'app/modules/admin/services/followup.service';
import { ConfiguracionService } from 'app/modules/admin/services/configuracion.service';
import { getSessionCompanyId, getSessionEntityId, getSessionUserId, getSessionTeam, getSessionLevelUser } from 'app/core/auth/auth-session';

interface FilterEntityOption { id: number | string; name: string; }
interface FilterUserOption { id: number | string; name: string; checked: boolean; }
interface PermissionRow {
    key: string;
    idSubmodulo: number;
    idModulo: number;
    permiso: number;
    modulo: string;
    submodulo: string;
}
interface PermissionState { view: boolean; edit: boolean; }
type PermissionMode = 'single' | 'bulk';

import { PermissionEditLockDirective } from 'app/modules/admin/directives/permission-edit-lock.directive';

import { PermissionHideIfNoEditDirective } from 'app/modules/admin/directives/permission-hide-if-no-edit.directive';

@Component({
    selector: 'app-configuracion-permisos',
    standalone: true,
    imports: [CommonModule, FormsModule, PermissionEditLockDirective, PermissionHideIfNoEditDirective],
    templateUrl: './permisos.component.html',
})
export class PermisosComponent {
    id_company = getSessionCompanyId();
    requester_user_id = getSessionUserId();
    mode: PermissionMode = 'single';

    entidades: FilterEntityOption[] = [];
    equipos: string[] = [];
    usuarios: FilterUserOption[] = [];

    selectedEntidad: number | string | null = null;
    selectedEquipo: string | null = null;
    selectedSingleUserId: number | string | null = null;
    showUserDropdown = false;

    loadingEntidades = false;
    loadingEquipos = false;
    loadingUsuarios = false;

    permissionRows: PermissionRow[] = [
        { key: 'opsp.dashboard', idSubmodulo: 1, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Dashboard' },
        { key: 'opsp.formats', idSubmodulo: 2, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Formatos' },
        { key: 'opsp.formats.vision', idSubmodulo: 3, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Vision' },
        { key: 'opsp.formats.centralclient', idSubmodulo: 4, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Cliente central' },
        { key: 'opsp.formats.strata', idSubmodulo: 5, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: '7 estratos' },
        { key: 'opsp.formats.bhag', idSubmodulo: 6, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'BHAG' },
        { key: 'opsp.formats.brandpromises', idSubmodulo: 7, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Brand promises' },
        { key: 'opsp.formats.corevalues', idSubmodulo: 8, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Core values' },
        { key: 'opsp.formats.factorx', idSubmodulo: 9, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Factor X' },
        { key: 'opsp.formats.flywheel', idSubmodulo: 10, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Flywheel' },
        { key: 'opsp.formats.purpose', idSubmodulo: 11, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Purpose' },
        { key: 'opsp.formats.balancekpis', idSubmodulo: 12, idModulo: 1, permiso: 1, modulo: 'OPSP', submodulo: 'Balance KPIs' },
        { key: 'followup.main', idSubmodulo: 13, idModulo: 2, permiso: 1, modulo: 'Follow up', submodulo: 'Principal' },
        { key: 'cash.formats', idSubmodulo: 14, idModulo: 3, permiso: 1, modulo: 'Cash', submodulo: 'Formatos' },
        { key: 'cash.formats.finance', idSubmodulo: 15, idModulo: 3, permiso: 1, modulo: 'Cash', submodulo: 'Finance' },
        { key: 'cash.formats.value', idSubmodulo: 16, idModulo: 3, permiso: 1, modulo: 'Cash', submodulo: 'Value' },
        { key: 'cash.formats.optcash', idSubmodulo: 17, idModulo: 3, permiso: 1, modulo: 'Cash', submodulo: 'Opt cash' },
        { key: 'cash.formats.iel', idSubmodulo: 18, idModulo: 3, permiso: 1, modulo: 'Cash', submodulo: 'IEL' },
        { key: 'ejecucion.formats', idSubmodulo: 19, idModulo: 4, permiso: 1, modulo: 'Ejecucion', submodulo: 'Formatos' },
        { key: 'ejecucion.formats.face', idSubmodulo: 20, idModulo: 4, permiso: 1, modulo: 'Ejecucion', submodulo: 'Face' },
        { key: 'ejecucion.formats.pace', idSubmodulo: 21, idModulo: 4, permiso: 1, modulo: 'Ejecucion', submodulo: 'Pace' },
        { key: 'ejecucion.formats.www', idSubmodulo: 22, idModulo: 4, permiso: 1, modulo: 'Ejecucion', submodulo: 'WWW' },
        { key: 'ejecucion.formats.rockefeller', idSubmodulo: 23, idModulo: 4, permiso: 1, modulo: 'Ejecucion', submodulo: 'Habitos de Rockefeller' },
        { key: 'configuracion.usuarios', idSubmodulo: 24, idModulo: 5, permiso: 1, modulo: 'Configuracion', submodulo: 'Usuarios' },
        { key: 'configuracion.permisos', idSubmodulo: 25, idModulo: 5, permiso: 1, modulo: 'Configuracion', submodulo: 'Permisos' },
    ];

    // Simulacion local: userId -> permissionKey -> state
    permissionsByUser: Record<string, Record<string, PermissionState>> = {};

    constructor(
        private followupService: FollowupService,
        private configuracionService: ConfiguracionService
    ) {}

    ngOnInit(): void {
        this.loadEntities();
    }

    get selectedUsers(): FilterUserOption[] {
        return this.usuarios.filter(u => u.checked);
    }

    get selectedSingleUser(): FilterUserOption | null {
        return this.usuarios.find(u => String(u.id) === String(this.selectedSingleUserId)) || null;
    }

    get activeUsers(): FilterUserOption[] {
        if (this.mode === 'single') {
            return this.selectedSingleUser ? [this.selectedSingleUser] : [];
        }
        return this.selectedUsers;
    }

    get selectedUserNames(): string {
        const names = this.selectedUsers.map(u => u.name);
        return names.length ? names.join(', ') : 'Seleccionar usuarios';
    }

    async loadEntities(): Promise<void> {
        this.loadingEntidades = true;
        try {
            const resp = await this.followupService.getEntitiesByCompany(this.id_company);
            const rows = Array.isArray(resp?.data) ? resp.data : [];
            this.entidades = rows
                .map((r: any) => ({
                    id: r?.id_entity ?? r?.entity_id ?? r?.id,
                    name: (r?.name_entity ?? r?.entity_name ?? r?.name ?? '').toString().trim(),
                }))
                .filter((x: FilterEntityOption) => x.id != null && !!x.name);
            const defaultEntity = this.entidades.find(e => String(e.id) === String(getSessionEntityId()));
            if (defaultEntity) {
                this.selectedEntidad = defaultEntity.id;
                await this.onEntidadChange();
            }
        } catch (err) {
            console.error('Error cargando entidades:', err);
            this.entidades = [];
        } finally {
            this.loadingEntidades = false;
        }
    }

    async onEntidadChange(): Promise<void> {
        this.selectedEquipo = null;
        this.selectedSingleUserId = null;
        this.equipos = [];
        this.usuarios = [];
        this.showUserDropdown = false;
        if (this.selectedEntidad == null || this.selectedEntidad === '') return;

        this.loadingEquipos = true;
        try {
            const resp = await this.followupService.getTeamMembersByEntity(
                this.requester_user_id,
                this.selectedEntidad,
                this.id_company
            );
            const rows = Array.isArray(resp?.data) ? resp.data : [];
            this.equipos = rows
                .map((r: any) => (typeof r === 'string' ? r : r?.team ?? r?.team_name ?? r?.name ?? ''))
                .map((x: any) => x.toString().trim())
                .filter(Boolean);
        } catch (err) {
            console.error('Error cargando equipos:', err);
            this.equipos = [];
        } finally {
            this.loadingEquipos = false;
        }
    }

    async onEquipoChange(): Promise<void> {
        this.usuarios = [];
        this.showUserDropdown = false;
        this.selectedSingleUserId = null;
        if (
            this.selectedEntidad == null || this.selectedEntidad === '' ||
            !this.selectedEquipo
        ) return;

        this.loadingUsuarios = true;
        try {
            const resp = await this.followupService.getTeamMembersByTeam(
                this.selectedEquipo,
                this.selectedEntidad,
                this.id_company
            );
            const rows = Array.isArray(resp?.data) ? resp.data : [];
            this.usuarios = rows
                .map((u: any) => {
                    const id = u?.id_user ?? u?.user_id ?? u?.id;
                    const first = (u?.firstname ?? '').toString().trim();
                    const last = (u?.lastname ?? '').toString().trim();
                    const name = `${first} ${last}`.trim() || (u?.name ?? '').toString().trim();
                    return { id, name, checked: false };
                })
                .filter((u: FilterUserOption) => u.id != null && !!u.name);
        } catch (err) {
            console.error('Error cargando usuarios:', err);
            this.usuarios = [];
        } finally {
            this.loadingUsuarios = false;
        }
    }

    onUserSelectionChange(): void {
        // no-op for now, kept for parity with dashboard behavior
    }

    async onSingleUserChange(): Promise<void> {
        if (this.selectedSingleUserId == null || this.selectedSingleUserId === '') {
            return;
        }

        await this.loadPermissionsForSingleUser(this.selectedSingleUserId);
    }

    setMode(mode: PermissionMode): void {
        this.mode = mode;
        this.showUserDropdown = false;
        if (mode === 'single') {
            this.usuarios.forEach((user) => user.checked = false);
        } else {
            this.selectedSingleUserId = null;
        }
    }

    private ensureState(userId: number | string, permissionKey: string): PermissionState {
        const uid = String(userId);
        if (!this.permissionsByUser[uid]) this.permissionsByUser[uid] = {};
        if (!this.permissionsByUser[uid][permissionKey]) {
            this.permissionsByUser[uid][permissionKey] = { view: false, edit: false };
        }
        return this.permissionsByUser[uid][permissionKey];
    }

    isPermissionChecked(permissionKey: string, type: 'view' | 'edit'): boolean {
        const users = this.activeUsers;
        if (!users.length) return false;
        return users.every(u => this.ensureState(u.id, permissionKey)[type]);
    }

    setPermissionForSelected(permissionKey: string, type: 'view' | 'edit', checked: boolean): void {
        const users = this.activeUsers;
        users.forEach(u => {
            const state = this.ensureState(u.id, permissionKey);
            state[type] = checked;
            if (type === 'edit' && checked) state.view = true;
            if (type === 'view' && !checked) state.edit = false;
        });
    }

    private async loadPermissionsForSingleUser(userId: number | string): Promise<void> {
        try {
            const resp = await this.configuracionService.getPermissionsByUser(userId);
            const rows = Array.isArray(resp?.data) ? resp.data : [];
            const uid = String(userId);
            this.permissionsByUser[uid] = {};

            this.permissionRows.forEach((row) => {
                this.permissionsByUser[uid][row.key] = { view: false, edit: false };
            });

            rows.forEach((item: any) => {
                const row = this.permissionRows.find((permissionRow) =>
                    Number(permissionRow.idSubmodulo) === Number(item?.id_submodule)
                );
                if (!row) {
                    return;
                }
                this.permissionsByUser[uid][row.key] = {
                    view: !!item?.can_view,
                    edit: !!item?.can_edit,
                };
            });
        } catch (err) {
            console.error('Error cargando permisos del usuario:', err);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los permisos del usuario.',
                confirmButtonColor: '#003660',
            });
        }
    }

    private buildPermissionsPayload() {
        return this.permissionRows.map((row) => {
            return {
                id_submodule: row.idSubmodulo,
                can_view: this.isPermissionChecked(row.key, 'view'),
                can_edit: this.isPermissionChecked(row.key, 'edit'),
            };
        });
    }

    async saveSimulation(): Promise<void> {
        if (!this.activeUsers.length) {
            await Swal.fire({
                icon: 'warning',
                title: 'Sin usuarios',
                text: this.mode === 'single'
                    ? 'Selecciona un usuario para simular permisos.'
                    : 'Selecciona al menos un usuario para simular permisos.',
                confirmButtonColor: '#003660',
            });
            return;
        }

        const permissions = this.buildPermissionsPayload();

        try {
            if (this.mode === 'single') {
                await this.configuracionService.saveIndividualPermissions({
                    id_user: this.activeUsers[0].id,
                    created_by: this.requester_user_id,
                    permissions,
                });
            } else {
                await this.configuracionService.saveMassivePermissions({
                    users: this.activeUsers.map((user) => user.id),
                    created_by: this.requester_user_id,
                    permissions,
                });
            }

            await Swal.fire({
                icon: 'success',
                title: 'Permisos guardados',
                text: this.mode === 'single'
                    ? `Se guardaron los permisos para ${this.activeUsers[0]?.name || 'el usuario seleccionado'}.`
                    : `Se guardaron los permisos para ${this.activeUsers.length} usuario(s).`,
                confirmButtonColor: '#003660',
            });
        } catch (err) {
            console.error('Error guardando permisos:', err);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron guardar los permisos.',
                confirmButtonColor: '#003660',
            });
        }
    }
}



