import { Component, Injector } from '@angular/core';
import { IonRefresher, IonInfiniteScroll } from '@ionic/angular';
import { Item } from '../../services/item';
import { BasePage } from '../base-page/base-page';
import { SubCategory } from '../../services/sub-category';
import { Category } from '../../services/category';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'page-item-list',
  templateUrl: 'item-list.html',
  styleUrls: ['item-list.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class ItemListPage extends BasePage {

  public items: Item[] = [];
  public skeletonArray = Array(12);
  public params: any = {
    page: 0,
    limit: 40
  };

  protected category: Category;
  protected subcategory: SubCategory;
  protected searchText: string;

  constructor(injector: Injector, private itemService: Item) {
    super(injector);
  }

  ngOnInit() {
    this.params.sale = this.getQueryParams().sale;
    this.params.new = this.getQueryParams().new;
    this.params.featured = this.getQueryParams().featured;

    const subcategoryId = this.getParams().subcategoryId;

    if (subcategoryId) {
      const subcategory = new SubCategory;
      subcategory.id = subcategoryId
      this.params.subcategory = subcategory;
    }

    const categoryId = this.getParams().categoryId;

    if (categoryId) {
      const category = new Category;
      category.id = categoryId
      this.params.category = category;
    }

  }

  enableMenuSwipe(): boolean {
    return false;
  }

  async ionViewDidEnter() {

    if (!this.items.length) {
      this.showLoadingView({ showOverlay: false });
      this.loadData();
    }

    const title = await this.getTrans('ITEMS');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  onRefresh(event: any = {}) {
    this.refresher = event.target;
    this.items = [];
    this.params.page = 0;
    this.loadData();
  }

  async loadData() {

    try {
      let items = await this.itemService.load(this.params);

      for (const item of items) {
        this.items.push(item);
      }

      if (this.items.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }
  
      this.onRefreshComplete(items);

    } catch (error) {
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

  goToItemPage(item: Item) {
    this.navigateTo(this.currentPath + '/' + item.slug);
  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.params.page++;
    this.loadData();
  }

}
