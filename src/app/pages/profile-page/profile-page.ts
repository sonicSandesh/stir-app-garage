import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { User } from '../../services/user';
import { ProfileEditPage } from '../profile-edit/profile-edit';
import { ChangePasswordPage } from '../change-password/change-password';
import { SettingsPage } from '../settings-page/settings-page';
import { SignInPage } from '../sign-in/sign-in';
@Component({
  selector: 'page-profile-page',
  templateUrl: 'profile-page.html',
  styleUrls: ['profile-page.scss']
})
export class ProfilePage extends BasePage {

  public user: User;
  private loginSubscription: any;

  constructor(injector: Injector) {
    super(injector);
  }

  enableMenuSwipe() {
    return false;
  }

  async ionViewDidEnter() {
    this.user = User.getCurrent();

    const title = await this.getTrans('PROFILE');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  ngOnInit(): void {
    this.loginSubscription = (user) => {
      this.loginHandler(user);
    };
    this.events.subscribe('user:login', this.loginSubscription);
  }

  ionViewWillUnload() {
    if (this.loginSubscription) {
      this.events.unsubscribe('user:login', this.loginSubscription);
      this.loginSubscription = undefined;
    }
  }

  loginHandler(user: User) {
   this.user = user;
  }

  goTo(page: string) {
    this.navigateTo(this.currentPath + '/' + page);
  }

  async onPresentSignInModal() {
    const modal = await this.modalCtrl.create({
      component: SignInPage,
      componentProps: {
        showLoginForm: true
      }
    });

    return await modal.present();
  }

  async onPresentSignUpModal() {
    const modal = await this.modalCtrl.create({
      component: SignInPage,
      componentProps: {
        showSignUpForm: true
      }
    });

    return await modal.present();
  }

  async onPresentEditModal() {
    
    const modal = await this.modalCtrl.create({
      component: ProfileEditPage
    });

    return await modal.present();
  }

  async onPresentChangePasswordModal() {
    
    const modal = await this.modalCtrl.create({
      component: ChangePasswordPage
    });

    return await modal.present();
  }

  async onPresentSettingsModal() {
    
    const modal = await this.modalCtrl.create({
      component: SettingsPage
    });

    return await modal.present();
  }

  onLogout() {
    this.events.publish('user:logout');
  }

}
