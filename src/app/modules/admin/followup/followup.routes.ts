import { Routes } from '@angular/router';
import { FollowupComponent } from 'app/modules/admin/followup/followup.component';
import { permissionGuard } from 'app/modules/admin/guards/permission.guard';

export default [
    {
        path: '',
        pathMatch: 'full',
        component: FollowupComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 13 },
    },
] as Routes;
