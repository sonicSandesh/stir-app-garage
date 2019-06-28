import { Component, Injector, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Card } from '../../services/card';
import { BasePage } from '../base-page/base-page';
import { StripeService, StripeCardComponent, ElementOptions, ElementsOptions } from 'ngx-stripe';
import { Stripe } from '@ionic-native/stripe/ngx';

@Component({
  selector: 'page-card-add',
  templateUrl: 'card-add.html',
  styleUrls: ['card-add.scss']
})
export class CardAddPage extends BasePage implements OnInit {

  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  public form: FormGroup;
  public isSaving: boolean = false;
  public cardOptions: ElementOptions = {
    hidePostalCode: true
  };
  public elementsOptions: ElementsOptions = {};

  public mIsHybrid: boolean;

  constructor(injector: Injector,
    private stripeService: StripeService,
    private stripe: Stripe,
    private creditCardService: Card) {
    super(injector);
  }

  ngOnInit() {
    this.mIsHybrid = this.isHybrid();
    this.setupForm();
    this.setupStripeCard();
  }

  enableMenuSwipe() {
    return false;
  }

  setupStripeCard() {
    this.elementsOptions.locale = this.preference.lang;
  }

  setupForm() {

    let formGroup: any = {
      name: new FormControl('', Validators.required),
      address_line1: new FormControl('', Validators.required),
      address_city: new FormControl('', Validators.required),
      address_state: new FormControl('', Validators.required),
      address_zip: new FormControl('', Validators.required),
      address_country: new FormControl('', Validators.required),
    };

    if (this.mIsHybrid) {
      formGroup.number = new FormControl('', Validators.required);
      formGroup.expMonth = new FormControl('', Validators.required);
      formGroup.expYear = new FormControl('', Validators.required);
      formGroup.cvc = new FormControl('', Validators.required);
    }

    this.form = new FormGroup(formGroup);
  }

  onDismiss(card: Card = null) {
    this.modalCtrl.dismiss(card);
  }

  async onSubmit() {

    if (this.form.invalid) {
      return this.translate.get('INVALID_FORM').subscribe(str => this.showToast(str));
    }

    try {

      this.isSaving = true;

      const formData = Object.assign({}, this.form.value);

      let token1 = null;

      if (this.mIsHybrid) {
        token1 = await this.stripe.createCardToken(formData);
      } else {

        const { token, error } = await this.stripeService
        .createToken(this.card.getCard(), formData)
        .toPromise();

        if (error) {
          this.isSaving = false;
          return this.showToast(error.message);
        }

        token1 = token;
      }

      const card = await this.creditCardService.create({
        stripeToken: token1.id
      });

      this.isSaving = false;

      this.onDismiss(card);

    } catch (error) {

      let errorMessage = 'ERROR_NETWORK';

      if (typeof error === 'string' || error.code === 1002) {
        errorMessage = 'CARD_INVALID';
      }

      this.isSaving = false;
      this.translate.get(errorMessage).subscribe(str => this.showToast(str));
    }

  }

}