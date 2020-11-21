import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { OnlyAdminUsersGuard } from './admin-user-guard';
import { GuideModule } from '@app/guide/guide.module';

@NgModule({
    imports: [SharedModule, AdminRoutingModule, GuideModule],
    declarations: [AdminComponent],
    providers: [OnlyAdminUsersGuard]
})
export class AdminModule {}
