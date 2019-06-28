import { Component, Injector, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BasePage } from '../base-page/base-page';
import { User } from '../../services/user';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html',
})
export class SignInPage extends BasePage {

  private form: FormGroup;

  @Input() showLoginForm: boolean;
  @Input() showSignUpForm: boolean;

  public isLoadingByUsername: boolean = false;
  public isLoadingByFacebook: boolean = false;
  public isSignUpLoading: boolean = false;

  constructor(injector: Injector,
    private fb: Facebook,
    private userService: User) {
    super(injector);
  }

  ngOnInit() {

    if (this.showLoginForm) {
      this.setupLoginForm();
    } else if (this.showSignUpForm) {
      this.setupSignUpForm();
    }
  }

  enableMenuSwipe() {
    return false;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
  }

  onLoginButtonTouched() {
    this.showLoginForm = true;
    this.showSignUpForm = false;
    this.setupLoginForm();
  }

  onSignUpButtonTouched() {
    this.showLoginForm = false;
    this.showSignUpForm = true;
    this.setupSignUpForm();
  }

  setupLoginForm() {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  setupSignUpForm() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl(''),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  onFacebookButtonTouched() {

    if (!(this.isIos() || this.isAndroid())) {
      this.userService.loginViaFacebook()
      .then((user: User) => this.loggedViaFacebook(user))
      .catch(e => console.log('Error logging into Facebook', e));
    } else if (this.isPwa()) {
      this.translate.get('ERROR_FACEBOOK_PWA').subscribe((str: string) => this.showAlert(str));
    } else {
      this.fb.login(['public_profile'])
      .then((res: FacebookLoginResponse) => this.loggedIntoFacebook(res))
      .catch(e => console.log('Error logging into Facebook', e));
    }
    
  }

  async loggedIntoFacebook(res: FacebookLoginResponse) {

    let expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + res.authResponse.expiresIn);
    
    let expirationDateFormatted = expirationDate.toISOString();
 
    var facebookAuthData = {
      id: res.authResponse.userID,
      access_token: res.authResponse.accessToken,
      expiration_date: expirationDateFormatted
    };

    try {

      await this.showLoadingView({ showOverlay: false });
      this.isLoadingByFacebook = true;
      
      const user = await this.userService.linkWith('facebook', {
        authData: facebookAuthData
      });

      this.loggedViaFacebook(user);
      this.isLoadingByFacebook = false;
      
    } catch (error) {
      this.loginViaFacebookFailure(error);
      this.isLoadingByFacebook = false;
    }
    
  }

  loginViaFacebookFailure(error: any) {
    console.log('Error logging into Facebook', error);
    this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
    this.showContentView();
  }

  loggedViaFacebook(user: User) {
    this.showContentView();

    const transParams = { name: user.attributes.name };
    
    this.translate.get('LOGGED_IN_AS', transParams)
      .subscribe(str => this.showToast(str));

    this.events.publish('user:login', user);

    this.onDismiss();
  }

  async onLogin() {

    try {

      if (this.form.invalid) {
        const message = await this.getTrans('INVALID_FORM');
        return this.showToast(message);
      }

      await this.showLoadingView({ showOverlay: false });
      this.isLoadingByUsername = true;

      let user = await this.userService.signIn(this.form.value);

      this.showContentView();
      this.isLoadingByUsername = false;

      const transParams = { name: user.name };
      this.translate.get('LOGGED_IN_AS', transParams)
        .subscribe(str => this.showToast(str));

      this.onDismiss();

      this.events.publish('user:login', user);

    } catch (err) {

      if (err.code === 101) {
        this.translate.get('INVALID_CREDENTIALS')
        .subscribe(str => this.showToast(str));
      } else {
        this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));
      }

      this.showContentView();
      this.isLoadingByUsername = false;
    }
  }

  async onSignUp() {

    try {

      if (this.form.invalid) {
        const message = await this.getTrans('INVALID_FORM');
        return this.showToast(message);
      }
  
      const formData = Object.assign({}, this.form.value);
  
      if (formData.email === '') {
        delete formData.email;
      }

      await this.showLoadingView({ showOverlay: false });
      this.isSignUpLoading = true;
      
      let user = await this.userService.create(formData);

      this.showContentView();
      this.isSignUpLoading = false;

      const transParams = { name: user.name };
      this.translate.get('LOGGED_IN_AS', transParams).subscribe(str => this.showToast(str));

      this.onDismiss();

      this.events.publish('user:login', user);

    } catch (err) {

      this.showContentView();
      this.isSignUpLoading = false;

      if (err.code === 202) {
        this.translate.get('USERNAME_TAKEN').subscribe(str => this.showToast(str));
      } else if (err.code === 203) {
        this.translate.get('EMAIL_TAKEN').subscribe(str => this.showToast(str));
      } else if (err.code === 125) {
        this.translate.get('EMAIL_INVALID').subscribe(str => this.showToast(str));
      } else {
        this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      }
    }
  }

  async onForgotPasswordButtonTouched() {
    const modal = await this.modalCtrl.create({
      component: ForgotPasswordPage,
    });

    return await modal.present();
  }

}