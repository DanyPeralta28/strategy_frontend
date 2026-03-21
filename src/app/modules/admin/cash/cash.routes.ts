import { Routes } from '@angular/router';
import { FormatsComponent } from 'app/modules/admin/cash/formats/formats.component';
import { IelComponent } from 'app/modules/admin/cash/formats/iel/iel.component';
import { OptcashComponent } from 'app/modules/admin/cash/formats/optcash/optcash.component';
import { ValueComponent } from 'app/modules/admin/cash/formats/value/value.component';
import { FinanceComponent } from 'app/modules/admin/cash/formats/finance/finance.component';
import { permissionGuard } from 'app/modules/admin/guards/permission.guard';

export default [
    {
        path: '',
        pathMatch: 'full',
        component: FormatsComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 14 },
    },
    {
        path: 'formats',
        component: FormatsComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 14 },
    },
    {
        path: 'formats/iel',
        component: IelComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 18 },
    },
    {
        path: 'formats/optcash',
        component: OptcashComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 17 },
    },
    {
        path: 'formats/value',
        component: ValueComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 16 },
    },
    {
        path: 'formats/finance',
        component: FinanceComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 15 },
    },
] as Routes;
