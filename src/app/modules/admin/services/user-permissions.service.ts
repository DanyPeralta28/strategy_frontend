import { Injectable } from '@angular/core';
import { getSessionUserId } from 'app/core/auth/auth-session';
import { ConfiguracionService } from 'app/modules/admin/services/configuracion.service';

export interface UserPermissionItem {
  id_module: number;
  name_module: string;
  id_submodule: number;
  name_submodule: string;
  can_view: boolean;
  can_edit: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserPermissionsService {
  private permissions = new Map<number, UserPermissionItem>();
  private loadPromise: Promise<void> | null = null;
  private loaded = false;

  constructor(private configuracionService: ConfiguracionService) {}

  async ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return;
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.configuracionService
      .getPermissionsByUser(getSessionUserId())
      .then((resp) => {
        const rows = Array.isArray(resp?.data) ? resp.data : [];
        this.permissions.clear();
        rows.forEach((row: UserPermissionItem) => {
          this.permissions.set(Number(row.id_submodule), row);
        });
        this.loaded = true;
      })
      .catch((error) => {
        console.error('Error cargando permisos del usuario actual:', error);
        this.permissions.clear();
        this.loaded = true;
      })
      .finally(() => {
        this.loadPromise = null;
      });

    return this.loadPromise;
  }

  async refresh(): Promise<void> {
    this.loaded = false;
    this.loadPromise = null;
    await this.ensureLoaded();
  }

  hasView(permissionId: number | null | undefined): boolean {
    if (!permissionId) {
      return true;
    }
    return !!this.permissions.get(Number(permissionId))?.can_view;
  }

  canEdit(permissionId: number | null | undefined): boolean {
    if (!permissionId) {
      return true;
    }
    return !!this.permissions.get(Number(permissionId))?.can_edit;
  }

  getFirstAllowedPath(): string {
    const routeMap: Array<{ id: number; path: string }> = [
      { id: 1, path: '/opsp' },
      { id: 2, path: '/opsp/formats' },
      { id: 3, path: '/opsp/formats/vision' },
      { id: 4, path: '/opsp/formats/centralclient' },
      { id: 5, path: '/opsp/formats/strata' },
      { id: 6, path: '/opsp/formats/bhag' },
      { id: 7, path: '/opsp/formats/brandpromises' },
      { id: 8, path: '/opsp/formats/corevalues' },
      { id: 9, path: '/opsp/formats/factorx' },
      { id: 10, path: '/opsp/formats/flywheel' },
      { id: 11, path: '/opsp/formats/purpose' },
      { id: 12, path: '/opsp/formats/balancekpis' },
      { id: 13, path: '/followup' },
      { id: 14, path: '/cash/formats' },
      { id: 15, path: '/cash/formats/finance' },
      { id: 16, path: '/cash/formats/value' },
      { id: 17, path: '/cash/formats/optcash' },
      { id: 18, path: '/cash/formats/iel' },
      { id: 19, path: '/ejecucion/formats' },
      { id: 20, path: '/ejecucion/formats/face' },
      { id: 21, path: '/ejecucion/formats/pace' },
      { id: 22, path: '/ejecucion/formats/www' },
      { id: 23, path: '/ejecucion/formats/rockefeller' },
      { id: 24, path: '/configuracion/usuarios' },
      { id: 25, path: '/configuracion/permisos' },
    ];

    return routeMap.find((item) => this.hasView(item.id))?.path || '/';
  }
}
