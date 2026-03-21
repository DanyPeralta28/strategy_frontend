import { Routes } from '@angular/router';
import { UsuariosComponent } from 'app/modules/admin/configuracion/usuarios/usuarios.component';
import { PermisosComponent } from 'app/modules/admin/configuracion/permisos/permisos.component';
import { permissionGuard } from 'app/modules/admin/guards/permission.guard';

export default [
    {
        path: '',
        pathMatch: 'full',
        component: UsuariosComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 24 },
    },
    {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 24 },
    },
    {
        path: 'permisos',
        component: PermisosComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 25 },
    },
] as Routes;
