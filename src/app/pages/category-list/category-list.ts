import { Component, Injector, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Category } from '../../services/category';
import { BasePage } from '../base-page/base-page';
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
  selector: 'page-category-list',
  templateUrl: 'category-list.html',
  styleUrls: ['category-list.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('40ms', [animate('100ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class CategoryListPage extends BasePage {

  @ViewChild(IonContent) container: IonContent;

  public categories: Category[] = [];
  public searchText: string;
  public params: any = {};
  public skeletonArray = Array(16);

  protected contentLoaded: Subject<any>;
  protected loadAndScroll: Observable<any>;

  constructor(injector: Injector,
    private categoryService: Category,
    private subCategoryService: SubCategory) {
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

    if (!this.categories.length) {
      await this.showLoadingView({ showOverlay: false });
      this.loadData();
    } else {
      this.onContentLoaded();
    }

    const title = await this.getTrans('CATEGORIES');
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

    this.refresher = event.target;

    try {

      this.categories  = await this.categoryService.load(this.params);
      this.onRefreshComplete();
      this.showContentView();
      this.onContentLoaded();
      
    } catch (error) {
      this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
      this.onRefreshComplete();
      this.showContentView();
    }

  }

  onViewAll() {
    this.navigateTo(this.currentPath + '/items');
  }

  async goToSubCategoryPage(category: Category) {

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

  onSearch(ev: any = {}) {
    this.searchText = ev.target.value;
  }

}
