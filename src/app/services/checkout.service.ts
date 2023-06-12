import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { PaymentInfo } from '../common/payment-info';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CheckoutService {

  private purchaseUrl = 'http://apispringboot-env.eba-gqfpymtm.us-east-2.elasticbeanstalk.com/api/checkout/purchase';

  private paymentIntentUrl = 'http://apispringboot-env.eba-gqfpymtm.us-east-2.elasticbeanstalk.com/api/checkout/payment-intent';


  constructor(private httpClient: HttpClient) { }

  placeOrder(purchase: Purchase): Observable<any>{
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }
}
