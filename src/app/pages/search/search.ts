import { Component, Injector, ViewChild } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Item } from '../../services/item';
import { Subject, Observable, merge } from 'rxjs';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
  styleUrls: ['search.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class SearchPage extends BasePage {

  @ViewChild(IonContent) container: IonContent;

  public items: Item[] = [];
  public params: any = {
    limit: 100
  };
  public skeletonArray = Array(12);
  public searchTerm: string;

  protected contentLoaded: Subject<any>;
  protected loadAndScroll: Observable<any>;

  constructor(injector: Injector, private itemService: Item) {
    super(injector);
    this.contentLoaded = new Subject();
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  ngOnInit() {
    this.setupObservable();
  }

  async ionViewDidEnter() {

    this.searchTerm = this.getParams().term;

    if (this.searchTerm) {
      this.params.canonical = this.searchTerm.toLowerCase();
      this.showLoadingView({ showOverlay: false });
      this.loadData();
    }

    const title = await this.getTrans('SEARCH');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  setupObservable() {
    this.loadAndScroll = merge(
      this.container.ionScroll,
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

      this.items = await this.itemService.load(this.params);

      if (this.items.length) {
        this.showContentView();
      } else {
        this.showEmptyView();
      }

      this.onContentLoaded();

      this.onRefreshComplete(this.items);

    } catch (error) {
      this.showContentView();
      this.onRefreshComplete();
      this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
    }

  }

  onSearch(e: any = {}) {
    this.params.canonical = e.target.value;

    if (this.params.canonical && this.params.canonical.trim() !== '') {
      this.params.canonical = this.params.canonical.toLowerCase();
      this.items = [];
      this.showLoadingView({ showOverlay: false });
      this.loadData();
    }
  }

  goToItemPage(item: Item) {
    this.navigateTo('/1/home/items/' + item.slug);
  }

}
