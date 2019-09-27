import { Component, Injector, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import { Cart } from '../../services/cart';
import { User } from '../../services/user';
import { Item } from 'src/app/services/item';
import { Subject, Observable, merge } from 'rxjs';
import { AppConfigService } from '../../services/app-config';
import * as Parse from 'parse';
@Component({
  selector: 'page-cart-page',
  templateUrl: 'cart-page.html',
  styleUrls: ['cart-page.scss']
})
export class CartPage extends BasePage {

  @ViewChild(IonContent) content: IonContent;

  public cart: Cart;
  public isSavingCart: boolean;

  protected contentLoaded: Subject<any>;
  protected loadAndScroll: Observable<any>;

  constructor(injector: Injector,
    private cartService: Cart) {

    super(injector);
    this.events.subscribe('user:loggedOut', () => {
      this.cart = null;
      this.showEmptyView();
    });

    this.events.subscribe('user:login', () => {
      this.loadData();
    });

    this.contentLoaded = new Subject();

  }

  enableMenuSwipe(): boolean {
    return true;
  }

  ngOnInit() {
    this.setupObservable();
  }

  async ionViewDidEnter() {

    if (User.getCurrent()) {
      this.showLoadingView({ showOverlay: false });
      this.loadData();
    } else {
      this.showEmptyView();
    }

    const title = await this.getTrans('CART');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  setupObservable() {
    this.loadAndScroll = merge(
      this.content.ionScroll,
      this.contentLoaded
    );
  }

  onContentLoaded() {
    setTimeout(() => {
      this.contentLoaded.next();
    }, 400);
  }

  async loadData(event: any = {}) {

    try {

      this.refresher = event.target;

      this.cart = await this.cartService.getOne();

      if (this.cart && !this.cart.empty()) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onContentLoaded();

      this.onRefreshComplete(this.cart);
      
    } catch (error) {
      this.showContentView();
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
    }
  }

  incrementQuantity(item: any) {
    item.qty = item.qty + 1;
    item.amount = item.qty * (item.salePrice || item.price);
    this.cart.calculateSubtotal();
  }

  decrementQuantity(item: any) {

    if (item.qty > 1) {
      item.qty = item.qty - 1;
      item.amount = item.qty * (item.salePrice || item.price);
      this.cart.calculateSubtotal();
    } else {
      this.onRemoveItem(item);
    }
  }

  async onRemoveItem(item: any) {

    try {

      let str = await this.getTrans('DELETE_CONFIRMATION');
      
      const res = await this.showConfirm(str);

      if (!res) return;

      await this.showLoadingView({ showOverlay: false });

      let index: number = this.cart.items.indexOf(item);
      if (index !== -1) {
        this.cart.items.splice(index, 1);
      }

      this.cart.calculateSubtotal();

      await this.cart.save();

      if (this.cart.empty()) {
        this.showEmptyView();
      } else {
        this.showContentView();
      }

      this.events.publish('cart:updated', this.cart);
      
    } catch (error) {
      this.showContentView();
    }

  }

  goToItemPage(item: Item) {
    this.navigateTo(this.currentPath + '/items/' + item.objectId);
  }

  async goToCheckout() {

    try {
      
      this.isSavingCart = true;
      await this.cart.save();
      this.isSavingCart = false;

      this.navigateTo(this.currentPath + '/' + 'checkout');
      
    } catch (error) {
      this.isSavingCart = false;
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
    }

  }

}
