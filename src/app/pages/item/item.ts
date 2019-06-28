import { Component, Injector, ViewChild } from '@angular/core';
import { IonSlides, IonContent } from '@ionic/angular';
import { BasePage } from '../base-page/base-page';
import { Item } from '../../services/item';
import { Cart } from '../../services/cart';
import { User } from '../../services/user';
import { SignInPage } from '../sign-in/sign-in';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SharePage } from '../share/share.page';
import { Subject, Observable, merge } from 'rxjs';

@Component({
  selector: 'page-item',
  templateUrl: 'item.html',
  styleUrls: ['item.scss']
})
export class ItemPage extends BasePage {

  @ViewChild('slides') slides: IonSlides;
  @ViewChild(IonContent) content: IonContent;

  public item: Item;
  public itemDescription: any;
  public isAddingToCart: boolean = false;
  public isLiked: boolean = false;

  public webSocialShare: { show: boolean, share: any, onClosed: any } = {
    show: false,
    share: {
      config: [{
        facebook: {
          socialShareUrl: '',
        },
      }, {
        twitter: {
          socialShareUrl: '',
        }
      }, {
        whatsapp: {
          socialShareText: '',
          socialShareUrl: '',
        }
      }]
    },
    onClosed: () => {
      this.webSocialShare.show = false;
    }
  };

  protected slidesEvent: Subject<any>;
  protected slidesObservable: Observable<any>;

  constructor(injector: Injector,
    private socialSharing: SocialSharing,
    private itemService: Item,
    private cartService: Cart) {
    super(injector);
    this.slidesEvent = new Subject();
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  ngOnInit() {
    this.setupObservables();
  }

  setupObservables() {
    
    this.slidesObservable = merge(
      this.content.ionScroll,
      this.slidesEvent
    );
  }

  async ionViewDidEnter() {

    try {

      await this.showLoadingView({ showOverlay: false });
  
      const itemId = await this.getParams().itemId;
      this.item = await this.itemService.loadOne(itemId);

      this.itemDescription = this.sanitizer.bypassSecurityTrustHtml(this.item.description);

      this.setPageTitle(this.item.name);

      this.setMetaTags({
        title: this.item.name,
        description: this.item.description,
        image: this.item.featuredImage.url(),
        slug: this.item.slug
      });

      this.webSocialShare.share.config.forEach((item: any) => {
        if (item.whatsapp) {
          item.whatsapp.socialShareUrl = this.getShareUrl(this.item.slug);
        } else if (item.facebook) {
          item.facebook.socialShareUrl = this.getShareUrl(this.item.slug);
        } else if (item.twitter) {
          item.twitter.socialShareUrl = this.getShareUrl(this.item.slug);
        }
      });

      this.showContentView();
      this.checkIfItemIsLiked();
      this.trackView();
      
    } catch (error) {
      this.showErrorView();
    }

  }

  onSlidesDidLoad() {
    this.slidesEvent.next();
   }
 
   onSlidesWillChange() {
     this.slidesEvent.next();
   }

  async presentSignInModal() {
    const modal = await this.modalCtrl.create({
      component: SignInPage,
      componentProps: {
        showLoginForm: true
      }
    });

    return await modal.present();
  }

  async checkIfItemIsLiked() {

    if (User.getCurrent()) {

      try {
        this.isLiked = await this.itemService.isLiked(this.item.id);
      } catch (error) {
        console.warn(error.message);
      }
    
    }
  }

  async trackView() {
    try {
      await this.itemService.trackView(this.item.id);
    } catch (error) {
      console.warn(error.message);
    }
  }

  async onShare () {

    if (this.isHybrid()) {

      try {
        const url = this.getShareUrl(this.item.slug);
        await this.socialSharing.share(this.item.name, null, null, url);
      } catch (err) {
        console.warn(err)
      }
      
    } else if (this.isPwa() || this.isMobile()) {
      this.webSocialShare.show = true;
    } else {
      this.openShareModal();
    }
   
  }

  async openShareModal() {
    const modal = await this.modalCtrl.create({
      component: SharePage,
      componentProps: {
        url: this.getShareUrl(this.item.slug)
      }
    })
    return await modal.present();
  }

  async onLike() {

    if (User.getCurrent()) {

      try {
        this.isLiked = !this.isLiked;
        await this.itemService.like(this.item.id);
      } catch (error) {
        console.log(error.message);
      }

    } else {
      this.presentSignInModal();
    }
    
  }

  async onAddToCart() {

    try {

      if (!User.getCurrent()) {
        return this.presentSignInModal();
      }

      this.isAddingToCart = true;
  
      const rawItem = Object.assign({}, this.item.toJSON());

      const allowed: any = ['objectId'];

      const filteredItem: any = Object.keys(rawItem)
      .filter(key => allowed.includes(key))
      .reduce((obj, key) => {
        obj[key] = rawItem[key];
        return obj;
      }, {});

      filteredItem.qty = 1;
  
      let cart = await this.cartService.getOne();
      cart = cart || new Cart;

      const existInCart = cart.items
      .find(item => item.objectId === filteredItem.objectId)
  
      if (existInCart) {
        this.isAddingToCart = false;
        return this.translate.get('ITEM_ALREADY_IN_CART')
          .subscribe(str => this.showToast(str));
      }
  
      cart.items.push(filteredItem);
  
      await cart.save();
  
      this.isAddingToCart = false;
  
      this.translate.get('ITEM_ADDED_TO_CART').subscribe(str => this.showToast(str));
  
      this.events.publish('cart:updated', cart);
      
    } catch (err) {
      this.isAddingToCart = false;
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showAlert(str));
    }
  }
}
