import { NgModule } from '@angular/core';
import { SafePipe } from '@app/shared/pipes/SafePipe';

import { SharedModule } from '../shared/shared.module';

import { GuideComponent } from './guide.component';
import { CardComponent } from './card/card.component';
import { CardSmallComponent } from './card/card-small.component';

@NgModule({
    imports: [SharedModule],
    exports: [GuideComponent],
    declarations: [GuideComponent, CardComponent, CardSmallComponent, SafePipe],
})
export class GuideModule {}
