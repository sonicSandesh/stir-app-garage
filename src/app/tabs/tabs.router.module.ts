import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../services/guards/auth.guard';

const routes: Routes = [
  {
    path: '1',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: '../pages/home/home.module#HomePageModule'
          },
          {
            path: 'search',
            loadChildren: '../pages/search/search.module#SearchPageModule'
          },
          {
            path: 'search/:term',
            loadChildren: '../pages/search/search.module#SearchPageModule'
          },
          {
            path: 'items',
            loadChildren: '../pages/item-list/item-list.module#ItemListPageModule'
          },
          {
            path: ':categoryId/items',
            loadChildren: '../pages/item-list/item-list.module#ItemListPageModule'
          },
          {
            path: ':categoryId/items/:itemId',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: 'items/:itemId',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: 'items/:itemId/:slug',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: ':categoryId',
            loadChildren: '../pages/sub-category-list/sub-category-list.module#SubCategoryListPageModule'
          },
          {
            path: ':categoryId/:subcategoryId',
            loadChildren: '../pages/item-list/item-list.module#ItemListPageModule'
          },
          {
            path: ':categoryId/:subcategoryId/:itemId',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: ':categoryId/:subcategoryId/:itemId/:slug',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
        ]
      },
      {
        path: 'browse',
        children: [
          {
            path: '',
            loadChildren: '../pages/category-list/category-list.module#CategoryListPageModule'
          },
          {
            path: 'items',
            loadChildren: '../pages/item-list/item-list.module#ItemListPageModule'
          },
          {
            path: 'items/:itemId',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: 'items/:itemId/:slug',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: ':categoryId/items',
            loadChildren: '../pages/item-list/item-list.module#ItemListPageModule'
          },
          {
            path: ':categoryId/:subcategoryId',
            loadChildren: '../pages/item-list/item-list.module#ItemListPageModule'
          },
          {
            path: ':categoryId/:subcategoryId/:itemId',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: ':categoryId/:subcategoryId/:itemId/:slug',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: ':categoryId',
            loadChildren: '../pages/sub-category-list/sub-category-list.module#SubCategoryListPageModule'
          },
        ]
      },
      {
        path: 'cart',
        children: [
          {
            path: '',
            loadChildren: '../pages/cart-page/cart-page.module#CartPageModule'
          },
          {
            path: 'items/:itemId',
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: 'checkout',
            loadChildren: '../pages/checkout-page/checkout-page.module#CheckoutPageModule'
          },
          {
            path: 'checkout/thanks/:orderId',
            loadChildren: '../pages/thanks-page/thanks-page.module#ThanksPageModule'
          }
        ]
      },
      {
        path: 'account',
        children: [
          {
            path: '',
            loadChildren: '../pages/profile-page/profile-page.module#ProfilePageModule'
          },
          {
            path: 'payment',
            canActivate: [AuthGuard],
            loadChildren: '../pages/card-list/card-list.module#CardListPageModule'
          },
          {
            path: 'addresses',
            canActivate: [AuthGuard],
            loadChildren: '../pages/address-list/address-list.module#AddressListPageModule'
          },
          {
            path: 'help',
            canActivate: [AuthGuard],
            loadChildren: '../pages/about/about.module#AboutPageModule'
          },
          {
            path: 'favorites',
            canActivate: [AuthGuard],
            loadChildren: '../pages/favorite/favorite.module#FavoritePageModule'
          },
          {
            path: 'favorites/:itemId',
            canActivate: [AuthGuard],
            loadChildren: '../pages/item/item.module#ItemPageModule'
          },
          {
            path: 'orders',
            canActivate: [AuthGuard],
            loadChildren: '../pages/order-list-page/order-list-page.module#OrderListPageModule'
          },
          {
            path: 'orders/:id',
            canActivate: [AuthGuard],
            loadChildren: '../pages/order-detail-page/order-detail-page.module#OrderDetailPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/1/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/1/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
