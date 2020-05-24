import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomePage } from './home';
import { SharedModule } from '../../shared.module';
import { ChoosePlanPageModule } from '../choose-plan/choose-plan.module';

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    SharedModule,
    ChoosePlanPageModule
  ],
})
export class HomePageModule { }
