import { Routes } from '@angular/router';
import { FollowupComponent } from 'app/modules/admin/followup/followup.component';

export default [
    {
        path: '',
        pathMatch: 'full',
        component: FollowupComponent,
    },
] as Routes;
