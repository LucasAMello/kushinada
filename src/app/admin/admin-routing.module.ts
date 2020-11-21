import { Routes, RouterModule } from '@angular/router';
import { OnlyAdminUsersGuard } from './admin-user-guard';

import { AdminComponent } from './admin.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: AdminComponent,
                canActivate: [OnlyAdminUsersGuard],
            },
        ],
    },
];

export const AdminRoutingModule = RouterModule.forChild(routes);
