import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Order } from '../../services/order';
import { IonRefresher } from '@ionic/angular';

@Component({
  selector: 'page-order-list-page',
  templateUrl: 'order-list-page.html',
  styleUrls: ['order-list-page.scss']
})
export class OrderListPage extends BasePage {

  public orders: Order[] = [];

  constructor(injector: Injector,
    private orderService: Order) {
    super(injector);
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  async ionViewDidEnter() {

    if (!this.orders.length) {
      this.showLoadingView({ showOverlay: false });
      this.loadData();
    }

    const title = await this.getTrans('MY_ORDERS');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
    
  }

  async loadData(event: any = {}) {

    try {

      this.refresher = event.target;

      this.orders = await this.orderService.load();
  
      if (this.orders.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onRefreshComplete(this.orders);
      
    } catch (error) {
      this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
      this.showContentView();
    }

  }

  onNavigateToOrderPage(order: Order) {
    this.navigateTo(this.currentPath + '/' + order.id);
  }

}
