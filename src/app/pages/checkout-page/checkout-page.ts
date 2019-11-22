import { Component, Injector } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BasePage } from '../base-page/base-page';
import { Cart } from '../../services/cart';
import { Order } from '../../services/order';
import { User } from '../../services/user';
import { CustomerAddress } from '../../services/customer-address';
import { Card } from '../../services/card';
import { AddressListModalPage } from '../address-list-modal/address-list';
import { CardListModalPage } from '../card-list-modal/card-list';
import { AppConfigService } from '../../services/app-config';
import * as Parse from 'parse';
//Declaring PayU's bolt
declare var bolt : any;

@Component({
  selector: 'page-checkout-page',
  templateUrl: 'checkout-page.html',
  styleUrls: ['checkout-page.scss']
})
export class CheckoutPage extends BasePage {
  
  public cart: Cart;
  public form: FormGroup;

  public address: CustomerAddress;
  public card: Card;

  public isLoadingCards: boolean;
  public isCreatingOrder: boolean;

  public varOrder: Order;

  today:string = new Date().toISOString();
  maxScheduleDate = new Date(new Date().setDate(new Date().getDate() + 3)).toISOString();
  public isOrderScheduled: boolean;

  timeSlots: Array<any>;

  deliveryDateArray: Array<string>;

  public areWeServing: boolean;
  public closedMessage: String;
  public minOrderValue: number;
  public minOrderDelCharge: number;

  constructor(injector: Injector,
    private cardService: Card,
    private cartService: Cart,
    private customerAddressService: CustomerAddress) {
    super(injector);
  }

  ngOnInit() {
    this.setupForm();

    this.deliveryDateArray = [];
    this.populateDeliveryDateArray(0);
  }

  populateDeliveryDateArray(ind) {
    if(ind === 0) {
      this.deliveryDateArray.push(new Date().toISOString());
      this.populateDeliveryDateArray(ind+1);
    } else if(ind <= 6) {
      this.deliveryDateArray.push(new Date(new Date().setDate(new Date().getDate() + ind)).toISOString());
      this.populateDeliveryDateArray(ind+1);
    }
  }

  setTimeSlots(scheduleDt) {
    this.timeSlots = [];
    let selectedSchedDate = new Date(scheduleDt);
    let isWeekend = (selectedSchedDate.getDay() == 0 || selectedSchedDate.getDay() == 6);
    let curDate = new Date();
    let isSameDay = curDate.getDate() === selectedSchedDate.getDate();

    if (!isSameDay) {
      selectedSchedDate.setHours(0);
      selectedSchedDate.setMinutes(0);
      this.populateTimeSlots(selectedSchedDate, isWeekend);
    } else {
      let curMinutes = selectedSchedDate.getMinutes();

      let delDate = new Date();
      
      if (curMinutes > 30) {
        delDate.setHours(selectedSchedDate.getHours()+2);
        delDate.setMinutes(0);
      }
      if (curMinutes <= 30) {
        delDate.setHours(selectedSchedDate.getHours()+1);
        delDate.setMinutes(30);
      }
      this.populateTimeSlots(delDate, isWeekend);
    }

    
  }

  populateTimeSlots(delDate, isWeekend) {
    let startHour = delDate.getHours();
    let startMin = delDate.getMinutes();
    let starTime = startHour + ':' + startMin;
    let starMills = delDate.toISOString();
    delDate.setMinutes(startMin+30);
    let endHour = delDate.getHours();
    let endMin = delDate.getMinutes();
    let enTime = endHour + ':' + endMin;
    let endMills = delDate.toISOString();

    if ((isWeekend && startHour>= 10 && startHour < 14 )) {
      this.timeSlots.push({startTime:starTime,endTime:enTime,startMillis:starMills,endMillis:endMills});
    } else if (startHour >= 18 && startHour < 22) {
      this.timeSlots.push({startTime:starTime,endTime:enTime,startMillis:starMills,endMillis:endMills});
    }
    if(endHour < 22 || (endHour === 22 && endMin <= 0)) {
      this.populateTimeSlots(delDate,isWeekend);
    }
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  setupForm() {

    this.form = new FormGroup({
      shipping: new FormControl(null, Validators.required),
      card: new FormControl(null),
      paymentMethod: new FormControl('Card', Validators.required),
      contactNumber: new FormControl(Parse.User.current().get('phone')),
      instructions: new FormControl(''),
      scheduleDate: new FormControl(),
      scheduleSlot: new FormControl(),
      deliverySchedule: new FormControl('now', Validators.required)
    });

  }

  async ionViewDidEnter() {
    
    if (User.getCurrent()) {
      this.showLoadingView({ showOverlay: false });
      this.loadCart();
      Parse.Cloud.run('areWeOpen').then((adminConfig) => {
        this.areWeServing = adminConfig.attributes.admin.isOpen;
        this.closedMessage = adminConfig.attributes.admin.openingAt;
        this.minOrderValue = adminConfig.attributes.admin.minOrder;
        this.minOrderDelCharge = adminConfig.attributes.admin.minOrderDelivery;
      });
    } else {
      this.showEmptyView();
    }

    const title = await this.getTrans('CHECKOUT');
    this.setPageTitle(title);

    this.setMetaTags({
      title: title
    });
  }

  async loadCart() {

    try {

      this.cart = await this.cartService.getOne();

      if (this.cart && !this.cart.empty()) {
        if(this.cart.hasScheduledItem === true) {
            this.form.controls.deliverySchedule.setValue('scheduled');
            this.isOrderScheduled = true;
            this.translate.get('ORDER_HAS_NON_CURRENT_ITEM').subscribe(str => this.showCustomToast(str, 4500));
        }
        this.loadAddresses();
      } else {
        this.showEmptyView();
      }
      
    } catch (error) {
      this.showContentView();
      this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
    }
  }

  async loadAddresses() {

    try {

      const addresses = await this.customerAddressService.load();

      if (addresses.length) {
        this.address = addresses[0];
        this.cart.shipping = this.address;
        this.form.controls.shipping.setValue(this.address);
        this.cart.calculateTotal(this.minOrderValue,this.minOrderDelCharge);
      }

      this.showContentView();
      
    } catch (error) {
      this.showErrorView();
      this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
    }

  }

  async loadCards() {

    try {

      this.isLoadingCards = true;

      const cards = await this.cardService.load();

      if (cards.length) {
        this.card = cards[0];
        this.form.controls.card.setValue(this.card);
      } else {
        this.onChangeCard();
      }

      this.isLoadingCards = false;
      
    } catch (error) {
      this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
      this.isLoadingCards = false;
    }

  }

  async onChangeAddress() {
    
    const modal = await this.modalCtrl.create({
      component: AddressListModalPage
    });

    modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.address = data;
      this.cart.shipping = this.address;
      this.form.controls.shipping.setValue(this.address);
      this.cart.calculateTotal(this.minOrderValue,this.minOrderDelCharge);
    }
  }

  async onChangeCard() {
    
    const modal = await this.modalCtrl.create({
      component: CardListModalPage
    });

    modal.present();

    const { data } = await  modal.onWillDismiss();

    if (data) {
      this.card = data;
      this.form.controls.card.setValue(data);
    } else if (!data && !this.card) {
      this.form.controls.paymentMethod.setValue('Cash');
      this.form.controls.card.setValue(null);
    }
  }

  onChangePaymentMethod(event: any = {}) {

    const paymentMethod = event.target.value; 
    
    if (paymentMethod === 'Cash') {
      this.form.controls.card.clearValidators();
      this.form.controls.card.setValue(null);
      this.form.controls.card.updateValueAndValidity();
    } else if (paymentMethod === 'Card') {
      this.form.controls.card.clearValidators();
      this.form.controls.card.setValue(null);
      this.form.controls.card.updateValueAndValidity();
      // Below is the original code that set validations on cards
      //this.form.controls.card.setValidators(Validators.required);
      //this.form.controls.card.updateValueAndValidity();
      //this.form.controls.card.setValue(this.card);

      //if (!this.card) this.loadCards();
    } else {
      // no match
    }
  }

  dateChanged() {
    this.setTimeSlots(this.form.controls.scheduleDate.value);
  }

  onDeliveryScheduleChange(event: any = {}) {
    this.isOrderScheduled = (event.target.value == 'scheduled');
  }

  prepareOrderData(): Order {
    
    const formData = Object.assign({}, this.form.value);

    let order = new Order;

    order.items = this.cart.items;
    order.paymentMethod = formData.paymentMethod;
    order.card = formData.card;
    order.shipping = formData.shipping;
    order.contactNumber = formData.contactNumber;
    order.instructions = formData.instructions;
    order.deliverySchedule = formData.deliverySchedule;
    order.scheduleDate = formData.scheduleDate;
    order.scheduleSlot = formData.scheduleSlot;

    return order;
  }

  onPaymentSuccess(outerThis:CheckoutPage) {

      outerThis.isCreatingOrder = false;
      outerThis.events.publish('cart:updated', new Cart);
      const path = outerThis.currentPath + '/thanks/' + outerThis.varOrder.id;
      outerThis.router.navigate([path], { replaceUrl: true });
  }

   onBoltResponse(outerThis:CheckoutPage, hashRequestData:any) {
    return function(BOLT) {
      if(BOLT.response.txnStatus == 'SUCCESS') {
          hashRequestData.money = BOLT.response.amount
          hashRequestData.status = BOLT.response.status
          hashRequestData.responseHash = BOLT.response.hash
          hashRequestData.orderId = outerThis.varOrder.id
          Parse.Cloud.run('evaluateBoltResponseHash',
        {hashResponseData : hashRequestData}).then((respData) => {
          if (respData === 'SUCCESS') {
              outerThis.varOrder.set('status', 'Paid')
              outerThis.varOrder.save()
              outerThis.onPaymentSuccess(outerThis);
            } else {
              outerThis.isCreatingOrder = false;
              alert('Payment Failed')
          }
          });
          
      } else if(BOLT.response.txnStatus == 'CANCEL') {
          outerThis.isCreatingOrder = false;
      } else if(BOLT.response.txnStatus == 'FAILED') {
          outerThis.isCreatingOrder = false;
      }
      
    }
    
  }

  async onPlaceOrder() {

    if(!this.areWeServing){
      if(!this.isOrderScheduled) {
        return this.translate.get('SCHEDULE_ORDER_INSTRUCTIONS').subscribe(str => this.showCustomToast(str,3000));
      }
    }
    if(this.isOrderScheduled) {
      if(!this.form.controls.scheduleDate.value) {
        return this.translate.get('SCHEDULE_DATE_MISSING').subscribe(str => 
          this.showCustomToast(str,3000));
      } else if(!this.form.controls.scheduleSlot.value) {
        return this.translate.get('SCHEDULE_TIME_MISSING').subscribe(str => this.showCustomToast(str,3000));
      }
    }

    if(!this.isOrderScheduled) {
      this.form.controls.scheduleDate.setValue(null);
      this.form.controls.scheduleSlot.setValue(null);
    }

    try {

      this.isCreatingOrder = true;

      const order = this.prepareOrderData();
      await order.save();
      if(order.id && order.paymentMethod === 'Card') {
        const transactionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const currentUser = Parse.User.current();
        const hashRequestData = {
          txnid : transactionId,
          firstname : currentUser.get('name'),
          email : currentUser.getEmail(),
          prodinfo : order.firstItem.name,
          money : order.total
        }

        const requestConfData = await Parse.Cloud.run('getBoltRequestHash',
          {hashRequestData : hashRequestData});
        const requestData = {
                              key: requestConfData.puKey,
                              txnid: transactionId,
                              hash: requestConfData.requestHash,
                              amount: order.total,
                              firstname: currentUser.get('name'),
                              email: currentUser.getEmail(),
                              phone: currentUser.get('phone'),
                              productinfo: order.firstItem.name,
                              surl : 'https://stirpot.in',
                              furl: 'https://stirpot.in'
                            }

        this.varOrder = order;
        bolt.launch(requestData, {
          responseHandler: this.onBoltResponse(this,hashRequestData),
          catchException: function (BOLT) {
            this.showToast( BOLT.message );
          }
        });
      } else if(order.id && order.paymentMethod === 'Cash') {
        this.isCreatingOrder = false;

        this.events.publish('cart:updated', new Cart);

        const path = this.currentPath + '/thanks/' + order.id;

        this.router.navigate([path], { replaceUrl: true });
      }
      
    } catch (err) {

      if (err.code === 1001) { 
        this.translate.get('ACCOUNT_BLOCKED').subscribe((str) => this.showToast(str));
      } else if (err.code === 1002) { {
        this.translate.get('CARD_DECLINED').subscribe((str) => this.showToast(str));
      }
      } else {
        this.translate.get('ERROR_NETWORK').subscribe((str) => this.showToast(str));
      }

      this.isCreatingOrder = false;
    }
    
  }

}
