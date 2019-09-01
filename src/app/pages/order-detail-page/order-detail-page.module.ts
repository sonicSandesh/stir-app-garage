import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OrderDetailPage } from './order-detail-page';
import { SharedModule } from '../../shared.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    OrderDetailPage,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
