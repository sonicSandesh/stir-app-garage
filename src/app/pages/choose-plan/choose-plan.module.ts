import { NgModule } from '@angular/core';
import { ChoosePlanPage } from './choose-plan';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [
    ChoosePlanPage,
  ],
  imports: [
    SharedModule
  ],
  entryComponents: [
    ChoosePlanPage
  ]
})
export class ChoosePlanPageModule {}
