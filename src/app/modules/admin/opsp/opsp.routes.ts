import { Routes } from '@angular/router';
import { OpspComponent } from 'app/modules/admin/opsp/opsp.component';
import { FormatsComponent } from 'app/modules/admin/opsp/formats/formats.component';
import { VisionComponent } from 'app/modules/admin/opsp/formats/vision/vision.component';
import { StrataComponent } from 'app/modules/admin/opsp/formats/strata/strata.component';
import { FdtComponent } from 'app/modules/admin/opsp/formats/fdt/fdt.component';
import { FactorxComponent } from 'app/modules/admin/opsp/formats/factorx/factorx.component';

export default [
    {
        path     : '',
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
    }
] as Routes;
