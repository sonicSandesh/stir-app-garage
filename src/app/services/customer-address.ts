import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class CustomerAddress extends Parse.Object {

  constructor() {
    super('CustomerAddress');
  }

  create(params: any = {}): Promise<CustomerAddress> {
    const obj = new CustomerAddress();
    return obj.save(params);
  }

  load(): Promise<CustomerAddress[]> {
    const query = new Parse.Query(CustomerAddress);
    query.include(['zone', 'subzone']);
    query.equalTo('customer', Parse.User.current());
    query.descending('createdAt');
    return query.find();
  }

  get address(): string {
    return this.get('address');
  }

  set address(val) {
    this.set('address', val);
  }

  get zone(): any {
    return this.get('zone');
  }

  set zone(val) {
    this.set('zone', val);
  }

  get subzone(): any {
    return this.get('subzone');
  }

  set subzone(val) {
    this.set('subzone', val);
  }

  toString(): string {
    return this.address;
  }

}

Parse.Object.registerSubclass('CustomerAddress', CustomerAddress);

