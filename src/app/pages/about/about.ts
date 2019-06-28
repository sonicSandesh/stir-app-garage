import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppConfigService } from '../../services/app-config';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  styleUrls: ['about.scss']
})
export class AboutPage extends BasePage {

  public version: string;
  public appConfig: AppConfigService;
  public about: any;

  constructor(injector: Injector,
    private appVersion: AppVersion,
    private appConfigService: AppConfigService) {
    super(injector);
  }

  enableMenuSwipe() {
    return false;
  }

  async ionViewDidEnter() {
    this.showLoadingView({ showOverlay: false });
    this.loadAppVersion();
    this.loadAppConfig();

    const title = await this.getTrans('SUPPORT');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async loadAppVersion() {
    try {
      this.version = await this.appVersion.getVersionNumber();
    } catch (error) {
      console.log(error);
    }
  }

  async loadAppConfig() {
    try {
      this.appConfig = await this.appConfigService.load();

      if (this.appConfig.about && this.appConfig.about.description) {
        this.about = this.sanitizer
        .bypassSecurityTrustHtml(this.appConfig.about.description);
      }

      this.showContentView();
    } catch (error) {
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      this.showContentView();
    }
  }

}
