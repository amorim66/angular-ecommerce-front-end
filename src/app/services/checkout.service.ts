import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CheckoutService {

  private purchaseUrl = 'http://apidockerbackend-env.eba-kvqvdgym.us-east-2.elasticbeanstalk.com/api/checkout/purchase';


  constructor(private httpClient: HttpClient) { }

  placeOrder(purchase: Purchase): Observable<any>{
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }
}
