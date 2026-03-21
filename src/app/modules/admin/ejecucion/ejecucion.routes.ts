import { Routes } from '@angular/router';
import { FormatsComponent } from './formats/formats.component';
import { FaceComponent } from './formats/face/face.component';
import { PaceComponent } from './formats/pace/pace.component';
import { RockefellerComponent } from './formats/rockefeller/rockefeller.component';
import { WwwComponent } from './formats/www/www.component';
import { permissionGuard } from 'app/modules/admin/guards/permission.guard';

export default [
    {
        path: '',
        pathMatch: 'full',
        component: FormatsComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 19 },
    },
    {
        path: 'formats',
        component: FormatsComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 19 },
    },
    {
        path: 'formats/face',
        component: FaceComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 20 },
    },
    {
        path: 'formats/pace',
        component: PaceComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 21 },
    },
    {
        path: 'formats/rockefeller',
        component: RockefellerComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 23 },
    },
    {
        path: 'formats/www',
        component: WwwComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 22 },
    },
] as Routes;
