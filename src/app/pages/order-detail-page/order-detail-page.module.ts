import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OrderDetailPage } from './order-detail-page';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [
    OrderDetailPage,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: OrderDetailPage,
      }
    ]),
    SharedModule
  ],
  exports: [
    OrderDetailPage
  ]
})
export class OrderDetailPageModule {}
