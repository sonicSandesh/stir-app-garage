import { Component, Injector, ViewChild } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { SubCategory } from '../../services/sub-category';
import { Category } from 'src/app/services/category';
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
  selector: 'page-sub-category-list',
  templateUrl: 'sub-category-list.html',
  styleUrls: ['sub-category-list.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('100ms', [animate('300ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class SubCategoryListPage extends BasePage {

  @ViewChild(IonContent) container: IonContent;

  public subcategories: SubCategory[] = [];
  public params: any = {};
  public searchText: string;

  protected contentLoaded: Subject<any>;
  protected loadAndScroll: Observable<any>;

  constructor(injector: Injector, public subCategoryService: SubCategory) {
    super(injector);
    this.contentLoaded = new Subject();
  }

  ngOnInit() {
    const category = new Category;
    category.id = this.getParams().categoryId;
    this.params.category = category;

    this.setupObservable();
  }

  enableMenuSwipe(): boolean {
    return false;
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

  async ionViewDidEnter() {

    if (!this.subcategories.length) {
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

  async loadData(event: any = {}) {

    this.refresher = event.target;

    try {

      this.subcategories = await this.subCategoryService.load(this.params);
      this.onRefreshComplete();
      this.showContentView();
      this.onContentLoaded();
      
    } catch (error) {
      this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
      this.onRefreshComplete();
      this.showContentView();
    }

  }

  onSubCategoryTouched(subcategory: SubCategory) {
    this.navigateTo(this.currentPath + '/' + subcategory.id);
  }

  onViewAll() {
    this.navigateTo(this.currentPath + '/items');
  }

  onSearch(ev: any = {}) {
    this.searchText = ev.target.value;
  }

}
