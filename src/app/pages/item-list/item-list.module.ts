import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemListPage } from './item-list';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [
    ItemListPage,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ItemListPage
      }
    ]),
    SharedModule
  ],
})
export class ItemListPageModule {}
