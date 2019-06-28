import { Component, Injector } from '@angular/core';
import { Item } from '../../services/item';
import { BasePage } from '../base-page/base-page';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
@Component({
  selector: 'page-favorite',
  templateUrl: 'favorite.html',
  styleUrls: ['favorite.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class FavoritePage extends BasePage {

  private params: any = {
    likes: true,
    page: 0,
    limit: 40
  };
  public items: Item[] = [];
  public skeletonArray = Array(12);

  constructor(injector: Injector, private itemService: Item) {
    super(injector);
  }

  enableMenuSwipe() {
    return true;
  }

  async ionViewDidEnter() {

    if (!this.items.length) {
      this.showLoadingView({ showOverlay: false });
      this.loadData();
    }
    
    const title = await this.getTrans('FAVORITES');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  goToItemPage(item: Item) {
    this.navigateTo(this.currentPath + '/' + item.id);
  }

  async loadData() {

    try {

      const items = await this.itemService.load(this.params);

      for (const item of items) {
        this.items.push(item);
      }

      if (this.items.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onRefreshComplete(items);

    } catch (err) {
      this.showContentView();
      this.onRefreshComplete();
      this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
    }

  }

  onSearch(ev: any = {}) {
    const val: string = ev.target.value;
    const canonical = (val && val.trim() != '') ? val.toLowerCase() : null;
    this.params.canonical = canonical;
    this.params.page = 0;
    this.items = [];
    this.showLoadingView({ showOverlay: false });
    this.loadData();
  }

  onSearchCleared() {
    this.params.canonical = '';
    this.params.page = 0;
    this.items = [];
    this.showLoadingView({ showOverlay: false });
    this.loadData();
  }

  onRefresh(event: any = {}) {
    this.refresher = event.target;
    this.items = [];
    this.params.page = 0;
    this.loadData();
  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.params.page++;
    this.loadData();
  }

}
