import { Component, Injector, ViewChild } from '@angular/core';
import { IonSlides, IonContent } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import { Slide } from '../../services/slide';
import { Item } from '../../services/item';
import * as Parse from 'parse';
import { Category } from '../../services/category';
import { SubCategory } from '../../services/sub-category';
import { Subject, Observable, merge } from 'rxjs';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styleUrls: ['home.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('70ms', [animate('100ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class HomePage extends BasePage {

  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonSlides) ionSlides: IonSlides;

  public slidesConfig = {
    slidesPerView: 1.2,
    spaceBetween: 10,
    grabCursor: true,
    zoom: false,
    breakpointsInverse: true,
    breakpoints: {
      992: {
        slidesPerView: 2.5,
        spaceBetween: 30,
        loop: false,
      },
    }
  };

  public skeletonArray = Array(6);

  public slides: Slide[] = [];
  public categories: Category[] = [];
  public itemsOnSale: Item[] = [];
  public itemsNewArrival: Item[] = [];
  public itemsFeatured: Item[] = [];
  public items: Item[] = [];

  private queryItems: any = {};

  protected contentLoaded: Subject<any>;
  protected loadAndScroll: Observable<any>;

  constructor(injector: Injector,
    private subCategoryService: SubCategory,
    private itemService: Item) {
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
    if (!this.items.length) {
      this.showLoadingView({ showOverlay: false });
      this.loadData();
    }

    const title = await this.getTrans('APP_NAME');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  onSlidesDidLoad() {
    this.ionSlides.startAutoplay();
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

  onSlideTouched(slide: Slide) {
    if (slide.item) {
      this.goToItemPage(slide.item);
    } else if (slide.url) {
      this.openUrl(slide.url);
    } else {
      // no action required
    }
  }

  async onCategoryTouched(category: Category) {

    try {

      if (category.subCategoryCount > 0) {
        this.navigateTo(this.currentPath + '/' + category.id);
      } else if (category.subCategoryCount === 0) {
        this.navigateTo(this.currentPath + '/' + category.id + '/items');
      } else {

        await this.showLoadingView({ showOverlay: false });

        const count = await this.subCategoryService.count({
          category: category
        });
    
        if (count) {
          this.navigateTo(this.currentPath + '/' + category.id);
        } else {
          this.navigateTo(this.currentPath + '/' + category.id + '/items');
        }
  
        this.showContentView();

      }
      
    } catch (error) {
      this.showContentView();
      this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
    }

  }

  onViewAll(params: any = {}) {
    this.navigateTo(this.currentPath + '/items', params);
  }

  loadData(event: any = {}) {

    this.refresher = event.target;

    Parse.Cloud.run('getHomePageData').then(data => {
      
      this.slides = data.slides;
      this.categories = data.categories;
      this.itemsOnSale = data.itemsOnSale;
      this.itemsNewArrival = data.itemsNewArrival;
      this.itemsFeatured = data.itemsFeatured;

      this.loadItems();

      this.onRefreshComplete();
      this.showContentView();

      this.onContentLoaded();

      if (this.ionSlides) {
        this.ionSlides.slideTo(0, 0);
        this.ionSlides.update();
      }
      

    }, () => {
      this.onRefreshComplete();
      this.showErrorView();
    });

  }

  onLoadMore(event: any = {}) {
    this.infiniteScroll = event.target;
    this.queryItems.page++;
    this.loadItems();
  }

  loadItems() {

    this.itemService.loadInCloud(this.queryItems).then((items: Item[]) => {

      for (let item of items) {
        this.items.push(item);
      }

      this.onRefreshComplete(items);

    }).catch(error => {
      console.warn(error);
    });

  }

  onSearch(event: any = {}) {

    const searchTerm = event.target.value;

    if (searchTerm) {
      this.navigateTo(this.currentPath + '/search/' + searchTerm);
    }
    
  }

  goToItemPage(item: Item) {
    this.navigateTo(this.currentPath + '/items/' + item.slug);
  }

}