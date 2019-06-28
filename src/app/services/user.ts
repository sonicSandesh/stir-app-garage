import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class User extends Parse.User {

  constructor() {
    super('_User');
  }

  static getInstance() {
    return this;
  }

  static getCurrent() {
    return <User>this.current();
  }

  isLoggedInViaPassword() {
    return !this.authData;
  }

  linkWith(provider: string, authData: any = {}): Promise<User> {
    const user: any = new User;
    return user._linkWith(provider, authData);
  }

  loginViaFacebook(): Promise<User> {
    return (Parse.FacebookUtils.logIn(null) as any);
  }

  isFacebookLinked(): boolean {
    return Parse.FacebookUtils.isLinked(Parse.User.current());
  }

  signIn(data: any = {}): Promise<User> {
    const user = new User;
    user.username = data.username;
    user.password = data.password;
    return user.logIn();
  }

  create(data: any = {}): Promise<User> {
    const user = new User;
    return user.signUp(data);
  }

  recoverPassword(email) {
    return Parse.User.requestPasswordReset(email);
  }

  logout() {
    return Parse.User.logOut();
  }

  get name(): string {
    return this.get('name');
  }

  set name(val) {
    this.set('name', val);
  }

  get email(): string {
    return this.get('email');
  }

  set email(val) {
    this.set('email', val);
  }

  get phone(): string {
    return this.get('phone');
  }

  set phone(val) {
    this.set('phone', val);
  }

  get username(): string {
    return this.get('username');
  }

  set username(val) {
    this.set('username', val);
  }

  get password(): string {
    return this.get('password');
  }

  set password(val) {
    this.set('password', val);
  }

  get authData(): string {
    return this.get('authData');
  }

  set authData(val) {
    this.set('authData', val);
  }

  get photo(): any {
    return this.get('photo');
  }

  set photo(val) {
    this.set('photo', val);
  }

}

Parse.Object.registerSubclass('_User', User);
