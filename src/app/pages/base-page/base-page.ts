import { Injector } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoadingController, NavController, ToastController, ModalController, Events, AlertController, IonRefresher, IonInfiniteScroll, Platform,
} from '@ionic/angular';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { Preference } from '../../services/preference';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { environment } from 'src/environments/environment';

export abstract class BasePage {

  public isErrorViewVisible: boolean;
  public isEmptyViewVisible: boolean;
  public isContentViewVisible: boolean;
  public isLoadingViewVisible: boolean;
  public isAuthViewVisible: boolean;

  public preference: Preference;

  private activatedRoute: ActivatedRoute;
  protected router: Router;
  private meta: Meta;
  private title: Title;

  protected refresher: IonRefresher;
  protected infiniteScroll: IonInfiniteScroll;
  protected translate: TranslateService;
  protected sanitizer: DomSanitizer;
  protected modalCtrl: ModalController;
  protected events: Events;

  private loader: any;
  private navCtrl: NavController;
  private toastCtrl: ToastController;
  private loadingCtrl: LoadingController;
  private alertCtrl: AlertController;
  private inAppBrowser: InAppBrowser;
  private platform: Platform;

  private mCurrentPath: string;

  constructor(injector: Injector) {
    this.router = injector.get(Router);
    this.activatedRoute = injector.get(ActivatedRoute);
    this.navCtrl = injector.get(NavController);
    this.loadingCtrl = injector.get(LoadingController);
    this.toastCtrl = injector.get(ToastController);
    this.alertCtrl = injector.get(AlertController);
    this.translate = injector.get(TranslateService);
    this.sanitizer = injector.get(DomSanitizer);
    this.preference = injector.get(Preference);
    this.events = injector.get(Events);
    this.modalCtrl = injector.get(ModalController);
    this.inAppBrowser = injector.get(InAppBrowser);
    this.platform = injector.get(Platform);

    this.meta = injector.get(Meta);
    this.title = injector.get(Title);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mCurrentPath = this.router.url.split('?')[0];
      }
    })
  }

  abstract enableMenuSwipe(): boolean;

  public get currentPath(): string {
    return this.mCurrentPath;
  }

  public get serverUrl(): string {
    return environment.serverUrl;
  }

  public get appUrl(): string {
    return environment.appUrl;
  }

  public get appId(): string {
    return environment.appId;
  }

  public get stripePublicKey(): string {
    return environment.serverUrl;
  }

  public get appImageUrl(): string {
    return environment.appImageUrl;
  }

  public setPageTitle(title: string): void {
    this.title.setTitle(title);
  }

  public async setMetaTags(config1: {
    title?: string,
    description?: string,
    image?: string,
    slug?: string }) {

    const str = await this.getTrans(['APP_NAME', 'APP_DESCRIPTION']);

    const config = {
      title : str.APP_NAME,
      description: str.APP_DESCRIPTION,
      image: this.appImageUrl,
      ...config1
    };

    let url = null;

    if (config.slug) {
      url = this.appUrl + '/' + config.slug
    } else {
      url = this.appUrl + this.currentPath;
    }

    this.meta.updateTag({
      property: 'og:title',
      content: config.title
    });
    this.meta.updateTag({
      property: 'og:description',
      content: config.description
    });
    
    this.meta.updateTag({
      property: 'og:image',
      content: config.image
    });

    this.meta.updateTag({
      property: 'og:image:alt',
      content: config.title
    });

    this.meta.updateTag({
      property: 'og:url',
      content: url
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image'
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: config.title
    });

    this.meta.updateTag({
      name: 'twitter:text:title',
      content: config.title
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: config.image
    });

    this.meta.updateTag({
      name: 'twitter:image:alt',
      content: config.title
    });
  }

  async showLoadingView(params: { showOverlay: boolean }) {

    this.isAuthViewVisible = false;
    this.isErrorViewVisible = false;
    this.isEmptyViewVisible = false;
    this.isContentViewVisible = false;
    this.isLoadingViewVisible = true;

    if (params.showOverlay) {
      const loadingText = await this.getTrans('LOADING');

      this.loader = await this.loadingCtrl.create({
        message: loadingText
      });
  
      return await this.loader.present();
    }

    return true;
  }

  async dismissLoadingView() {
    if (!this.loader) return;

    try {
      return await this.loader.dismiss()
    } catch (error) {
      console.log('ERROR: LoadingController dismiss', error);
    }
  }

  showContentView() {

    this.isAuthViewVisible = false;
    this.isErrorViewVisible = false;
    this.isEmptyViewVisible = false;
    this.isLoadingViewVisible = false;
    this.isContentViewVisible = true;

    this.dismissLoadingView();
  }

  showEmptyView() {

    this.isAuthViewVisible = false;
    this.isErrorViewVisible = false;
    this.isLoadingViewVisible = false;
    this.isContentViewVisible = false;
    this.isEmptyViewVisible = true;

    this.dismissLoadingView();
  }

  showErrorView() {

    this.isAuthViewVisible = false;
    this.isLoadingViewVisible = false;
    this.isContentViewVisible = false;
    this.isEmptyViewVisible = false;
    this.isErrorViewVisible = true;

    this.dismissLoadingView();
  }

  showAuthView() {
    
    this.isLoadingViewVisible = false;
    this.isContentViewVisible = false;
    this.isEmptyViewVisible = false;
    this.isErrorViewVisible = false;
    this.isAuthViewVisible = true;

    this.dismissLoadingView();
  }

  onRefreshComplete(data = null) {

    if (this.refresher) {
      this.refresher.complete();
    }

    if (this.infiniteScroll) {
      this.infiniteScroll.complete();

      if (data && data.length === 0) {
        this.infiniteScroll.disabled = true;
      } else {
        this.infiniteScroll.disabled = false;
      }
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });

    return await toast.present();
  }

  async showAlert(message: string) {
  
    const okText = await this.getTrans('OK');

    const alert = await this.alertCtrl.create({
      header: '',
      message: message,
      buttons: [okText]
    });

    return await alert.present();
  }

  showConfirm(message: string): Promise<any> {

    return new Promise(async (resolve) => {

      const str = await this.getTrans(['OK', 'CANCEL']);

      const confirm = await this.alertCtrl.create({
        header: '',
        message: message,
        buttons: [{
          text: str.CANCEL,
          role: 'cancel',
          handler: () => resolve(false),
        }, {
          text: str.OK,
          handler: () => resolve(true)
        }]
      });

      confirm.present();
      
    });

  }

  public getShareUrl(slug: string) {
    return this.appUrl + '/1/home/items/' + slug;
  }

  isDesktop(): boolean {
    return this.platform.is('desktop');
  }

  isIos(): boolean {
    return this.platform.is('ios');
  }

  isAndroid(): boolean {
    return this.platform.is('android');
  }

  isHybrid(): boolean {
    return this.platform.is('hybrid');
  }

  isPwa(): boolean {
    return this.platform.is('pwa');
  }

  isMobile(): boolean {
    return this.platform.is('mobile');
  }

  setRoot(url: string) {
    this.navCtrl.setDirection('root', false);
    this.router.navigateByUrl(url);
  }

  navigateTo(page: any, queryParams: any = {}) {
    return this.router.navigate([page], { queryParams: queryParams });
  }

  getParams() {
    return this.activatedRoute.snapshot.params;
  }

  getQueryParams() {
    return this.activatedRoute.snapshot.queryParams;
  }

  getTrans(key: string | string[]) {
    return this.translate.get(key).toPromise();
  }

  goToCartPage() {
    this.navigateTo('/1/cart');
  }

  async openUrl(url: string) {
    this.inAppBrowser.create(url, '_system');
  }

}
