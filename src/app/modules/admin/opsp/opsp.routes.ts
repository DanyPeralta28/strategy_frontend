import { Routes } from '@angular/router';
import { OpspComponent } from 'app/modules/admin/opsp/opsp.component';
import { FormatsComponent } from 'app/modules/admin/opsp/formats/formats.component';
import { VisionComponent } from 'app/modules/admin/opsp/formats/vision/vision.component';
import { StrataComponent } from 'app/modules/admin/opsp/formats/strata/strata.component';
import { FdtComponent } from 'app/modules/admin/opsp/formats/fdt/fdt.component';
import { FactorxComponent } from 'app/modules/admin/opsp/formats/factorx/factorx.component';
import { BalancekpisComponent } from 'app/modules/admin/opsp/formats/balancekpis/balancekpis.component';
import { UtilidadxComponent } from 'app/modules/admin/opsp/formats/utilidadx/utilidadx.component';
import { GoalsComponent } from 'app/modules/admin/opsp/formats/goals/goals.component';
import { CorevaluesComponent } from 'app/modules/admin/opsp/formats/corevalues/corevalues.component';
import { PurposeComponent } from 'app/modules/admin/opsp/formats/purpose/purpose.component';
import { KeycompetenciesComponent } from 'app/modules/admin/opsp/formats/keycompetencies/keycompetencies.component';
import { TerritoryComponent } from 'app/modules/admin/opsp/formats/territory/territory.component';
import { CultureComponent } from 'app/modules/admin/opsp/formats/culture/culture.component';
import { CentralClientComponent } from 'app/modules/admin/opsp/formats/centralclient/centralclient.component';
import { BrandpromisesComponent } from 'app/modules/admin/opsp/formats/brandpromises/brandpromises.component';
import { BhagComponent } from 'app/modules/admin/opsp/formats/bhag/bhag.component';
import { FlywheelComponent } from 'app/modules/admin/opsp/formats/flywheel/flywheel.component';

export default [
    {
        path: '',
        pathMatch: 'full',
        component: OpspComponent,
    },
    {
        path: 'formats',
        component: FormatsComponent
    },
    {
        path: 'formats/vision',
        component: VisionComponent
    },
    {
        path: 'formats/strata',
        component: StrataComponent
    },
    {
        path: 'formats/fdt',
        component: FdtComponent
    },
    {
        path: 'formats/factorx',
        component: FactorxComponent
    },
    {
        path: 'formats/balancekpis',
        component: BalancekpisComponent
    },
    {
        path: 'formats/utilidadx',
        component: UtilidadxComponent
    },
    {
        path: 'formats/goals',
        component: GoalsComponent
    },
    {
        path: 'formats/corevalues',
        component: CorevaluesComponent
    },
    {
        path: 'formats/purpose',
        component: PurposeComponent
    },
    {
        path: 'formats/keycompetencies',
        component: KeycompetenciesComponent
    },
    {
        path: 'formats/territory',
        component: TerritoryComponent
    },
    {
        path: 'formats/culture',
        component: CultureComponent
    },
    {
        path: 'formats/centralclient',
        component: CentralClientComponent
    },
    {
        path: 'formats/brandpromises',
        component: BrandpromisesComponent
    },
    {
        path: 'formats/bhag',
        component: BhagComponent
    },
        {
        path: 'formats/flywheel',
        component: FlywheelComponent
    },
] as Routes;
