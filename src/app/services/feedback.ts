import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class Feedback extends Parse.Object {

  constructor() {
    super('Feedback');
  }

  static getInstance() {
    return this;
  }

  get feedback(): number {
    return this.get('feedback')
  }

  get customer(): number {
    return this.get('customer')
  }

  get order(): number {
    return this.get('order')
  }

  get item(): number {
    return this.get('item')
  }

  get rating(): number {
    return this.get('rating')
  }
 }
 Parse.Object.registerSubclass('Feedback', Feedback);