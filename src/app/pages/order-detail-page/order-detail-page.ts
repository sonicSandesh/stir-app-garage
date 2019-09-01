import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { Order } from '../../services/order';
import { Feedback } from '../../services/feedback';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'page-order-detail-page',
  templateUrl: 'order-detail-page.html',
  styleUrls: ['order-detail-page.scss']
})
export class OrderDetailPage extends BasePage {

  public order: Order;
  public feedbackForm: FormGroup;

  constructor(injector: Injector, private orderService: Order) {
    super(injector);
  }

  ngOnInit() {
    this.setupForm();
  }

  setupForm() {
    this.feedbackForm = new FormGroup({
        feedbackText: new FormControl(''),
        rating: new FormControl('',Validators.required)
      })
  }

  async ionViewDidEnter() {

    try {

      await this.showLoadingView({ showOverlay: false });
  
      const orderId = await this.getParams().id;
      this.order = await this.orderService.loadOne(orderId);

      this.showContentView();
      
    } catch (error) {
      this.showErrorView();
    }

  }

  enableMenuSwipe(): boolean {
    return false;
  }

  formatBrand() {

    if (this.order && this.order.card) {
      return this.order.card.brand.toLowerCase().replace(' ', '_')
    }

    return '';
    
  }

  async onFeedbackSubmit() {
    if (this.feedbackForm.controls.rating.invalid) {
      return this.showToast('Please select rating.');
    }
    const formData = Object.assign({}, this.feedbackForm.value);
    const rating:String = formData.rating;
    const feedbackText:String = formData.feedbackText;

    let feedback = new Feedback;
    feedback.rating = rating;
    feedback.feedback = feedbackText;
    feedback.order = this.order;
    feedback.save();
    return this.showToast(requestData);
  }

}
