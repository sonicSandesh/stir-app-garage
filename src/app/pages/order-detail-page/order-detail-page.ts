import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Order } from '../../services/order';

@Component({
  selector: 'page-order-detail-page',
  templateUrl: 'order-detail-page.html',
  styleUrls: ['order-detail-page.scss']
})
export class OrderDetailPage extends BasePage {

  public order: Order;

  constructor(injector: Injector, private orderService: Order) {
    super(injector);
  }

  async ionViewDidEnter() {

    try {

      await this.showLoadingView({ showOverlay: false });
  
      const orderId = await this.getParams().id;
      this.order = await this.orderService.loadOne(orderId);

      this.showContentView();
      
    } catch (error) {
      this.showErrorView();
    }

  }

  enableMenuSwipe(): boolean {
    return false;
  }

  formatBrand() {

    if (this.order && this.order.card) {
      return this.order.card.brand.toLowerCase().replace(' ', '_')
    }

    return '';
    
  }

}
