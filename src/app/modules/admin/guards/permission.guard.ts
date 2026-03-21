import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserPermissionsService } from 'app/modules/admin/services/user-permissions.service';

export const permissionGuard: CanActivateFn = async (route) => {
  const permissionsService = inject(UserPermissionsService);
  const router = inject(Router);
  const permissionId = Number(route.data?.['permissionId'] ?? 0);

  await permissionsService.ensureLoaded();

  if (!permissionId || permissionsService.hasView(permissionId)) {
    return true;
  }

  await Swal.fire({
    icon: 'warning',
    title: 'Sin permiso',
    text: 'No tienes permisos para visualizar este modulo.',
    confirmButtonColor: '#003660',
  });

  return router.parseUrl(permissionsService.getFirstAllowedPath());
};
