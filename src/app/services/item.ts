import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class Item extends Parse.Object {

  constructor() {
    super('Item');
  }

  static getInstance() {
    return this;
  }

  loadInCloud(params: any = {}): Promise<Item[]> {
    return Parse.Cloud.run('getItems', params);
  }

  loadOne(id: string): Promise<Item> {
    const query = new Parse.Query(Item);
    return query.get(id);
  }

  load(params: any = {}): Promise<Item[]> {

    const query = new Parse.Query(Item);

    if (params.canonical) {
      query.contains('canonical', params.canonical);
    }

    if (params.category) {
      query.equalTo('category', params.category);
    }

    if (params.subcategory) {
      query.equalTo('subcategory', params.subcategory);
    }

    if (params.sale === '1') {
      query.greaterThan('salePrice', 0);
    }

    if (params.new === '1') {
      query.equalTo('isNewArrival', true)
    }

    if (params.featured === '1') {
      query.equalTo('isFeatured', true)
    }

    if (params.likes) {
      query.equalTo('likes', Parse.User.current());
    }

    if (params.limit) {
      query.limit(params.limit);
    }

    if (params.page && params.limit) {
      query.skip(params.page * params.limit);
    }

    query.equalTo('status', 'Active')
    query.include(['category', 'subcategory']);
    query.descending('createdAt');
    query.doesNotExist('deletedAt');

    return query.find()
  }

  like(itemId: string) {
    return Parse.Cloud.run('likeItem', { itemId: itemId });
  }

  isLiked(itemId: string): Promise<boolean> {
    return Parse.Cloud.run('isItemLiked', { itemId: itemId });
  }

  trackView(itemId: string) {
    return Parse.Cloud.run('trackViewItem', { itemId: itemId });
  }

  get objectId(): string {
    return this.objectId;
  }

  get name(): string {
    return this.get('name');
  }

  get status(): string {
    return this.get('status');
  }

  get subcategory(): any {
    return this.get('subcategory');
  }

  get images(): any {
    return this.get('images')
  }

  get price(): number {
    return this.get('price')
  }

  get salePrice(): number {
    return this.get('salePrice')
  }

  get isFeatured(): boolean {
    return this.get('isFeatured')
  }

  get isNewArrival(): boolean {
    return this.get('isNewArrival')
  }

  get featuredImageThumb(): any {
    return this.get('featuredImageThumb')
  }

  get featuredImage(): any {
    return this.get('featuredImage')
  }

  get description(): string {
    return this.get('description')
  }

  get category(): any {
    return this.get('category')
  }

  get discount(): number {
    return this.get('discount')
  }

  get slug(): string {
    return this.id + '/' + (this.get('slug') || '');
  }

}

Parse.Object.registerSubclass('Item', Item);