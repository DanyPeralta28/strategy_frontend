import { Routes } from '@angular/router';
import { OpspComponent } from 'app/modules/admin/opsp/opsp.component';
import { FormatsComponent } from 'app/modules/admin/opsp/formats/formats.component';
import { VisionComponent } from 'app/modules/admin/opsp/formats/vision/vision.component';
import { StrataComponent } from 'app/modules/admin/opsp/formats/strata/strata.component';
import { FdtComponent } from 'app/modules/admin/opsp/formats/fdt/fdt.component';
import { FactorxComponent } from 'app/modules/admin/opsp/formats/factorx/factorx.component';
import { BalancekpisComponent } from 'app/modules/admin/opsp/formats/balancekpis/balancekpis.component';
import { UtilidadxComponent } from './formats/utilidadx/utilidadx.component';
import { GoalsComponent } from 'app/modules/admin/opsp/formats/goals/goals.component';
import { CorevaluesComponent } from 'app/modules/admin/opsp/formats/corevalues/corevalues.component';
import { PurposeComponent } from 'app/modules/admin/opsp/formats/purpose/purpose.component';
import { KeycompetenciesComponent } from 'app/modules/admin/opsp/formats/keycompetencies/keycompetencies.component';
import { TerritoryComponent } from 'app/modules/admin/opsp/formats/territory/territory.component';
import { CultureComponent } from 'app/modules/admin/opsp/formats/culture/culture.component';
import { CentralClientComponent } from 'app/modules/admin/opsp/formats/centralclient/centralclient.component';
import { BrandpromisesComponent } from 'app/modules/admin/opsp/formats/brandpromises/brandpromises.component';
import { BhagComponent } from 'app/modules/admin/opsp/formats/bhag/bhag.component';
import { FlywheelComponent } from './formats/flywheel/flywheel.component';
import { permissionGuard } from 'app/modules/admin/guards/permission.guard';

export default [
    {
        path: '',
        pathMatch: 'full',
        component: OpspComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 1 },
    },
    {
        path: 'formats',
        component: FormatsComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 2 },
    },
    {
        path: 'formats/vision',
        component: VisionComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 3 },
    },
    {
        path: 'formats/strata',
        component: StrataComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 5 },
    },
    {
        path: 'formats/fdt',
        component: FdtComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 2 },
    },
    {
        path: 'formats/factorx',
        component: FactorxComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 9 },
    },
    {
        path: 'formats/balancekpis',
        component: BalancekpisComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 12 },
    },
    {
        path: 'formats/utilidadx',
        component: UtilidadxComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 2 },
    },
    {
        path: 'formats/goals',
        component: GoalsComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 2 },
    },
    {
        path: 'formats/corevalues',
        component: CorevaluesComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 8 },
    },
    {
        path: 'formats/purpose',
        component: PurposeComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 11 },
    },
    {
        path: 'formats/keycompetencies',
        component: KeycompetenciesComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 2 },
    },
    {
        path: 'formats/territory',
        component: TerritoryComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 2 },
    },
    {
        path: 'formats/culture',
        component: CultureComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 2 },
    },
    {
        path: 'formats/centralclient',
        component: CentralClientComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 4 },
    },
    {
        path: 'formats/brandpromises',
        component: BrandpromisesComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 7 },
    },
    {
        path: 'formats/bhag',
        component: BhagComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 6 },
    },
    {
        path: 'formats/flywheel',
        component: FlywheelComponent,
        canActivate: [permissionGuard],
        data: { permissionId: 10 },
    },
] as Routes;
