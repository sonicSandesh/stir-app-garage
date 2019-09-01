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

  set feedback(val) {
    this.set('feedback', val);
  }

  get customer(): number {
    return this.get('customer')
  }

  set customer(val) {
    this.set('customer', val);
  }

  get order(): any {
    return this.get('order')
  }

  set order(val) {
    this.set('order', val);
  }

  get item(): number {
    return this.get('item')
  }

  set item(val) {
    this.set('item', val);
  }

  get rating(): number {
    return this.get('rating')
  }

  set rating(val) {
    this.set('rating', val);
 }
 }
 Parse.Object.registerSubclass('Feedback', Feedback);