import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormServiceService } from 'src/app/services/shop-form-service.service';
import { CupKatValidators } from 'src/app/validators/cup-kat-validators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.qa';
import { PaymentInfo } from 'src/app/common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  // initialize Stripe API
  stripe = Stripe("pk_test_51NHyzZBM6f6lMdVSvQnRGcX089dZRL1AF3BQl6udzXXx0N5e8YXcfTECZQ9NQbh1QDFMshfXTRZOzN8l2uzv30je009FKLeslv");

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private shopFormService: ShopFormServiceService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router, private http: HttpClient) { }


  ngOnInit(): void {

    // setup Stripe payment form
    this.setupStripePaymentForm();

    this.reviewCartDetails();

    // read the user's email address from browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail') || '{}');
    

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
           Validators.minLength(2),
          CupKatValidators.notOnlyWhitespace]),

        lastName: new FormControl('', 
          [Validators.required,
           Validators.minLength(2),
           CupKatValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail,
          [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9._]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),
                                     CupKatValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),
                                   CupKatValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),
                                      CupKatValidators.notOnlyWhitespace]),
        number: new FormControl('', [Validators.required, Validators.minLength(2),
                                  CupKatValidators.notOnlyWhitespace]),
        complement: new FormControl('', [Validators.minLength(2)]),
        bairro: new FormControl('', [Validators.required, Validators.minLength(2),
          CupKatValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),
                                     CupKatValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),
                                   CupKatValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),
                                      CupKatValidators.notOnlyWhitespace]),
        number: new FormControl('', [Validators.required, Validators.minLength(2),
                                      CupKatValidators.notOnlyWhitespace]),
        complement: new FormControl('', [Validators.minLength(2)]),
        bairro: new FormControl('', [Validators.required, Validators.minLength(2),
          CupKatValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2),
          CupKatValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required,Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: [''],
        */
      }),
    });
    
    /*
    // ppulate credit cart months

    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // ppulate credit cart years

    this.shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );*/

    // Adiciona evento de mudança no campo de CEP
    this.shippingAddressZipCode!.valueChanges.subscribe((value: string) => {
      console.log("passou!");
      if (value && value.length === 8) {
        this.consultarCEPShipping(value);
      }
    });

    this.billingAddressZipCode!.valueChanges.subscribe((value: string) => {
      console.log("passou!");
      if (value && value.length === 8) {
        this.consultarCEPBilling(value);
      }
    });

  }
  setupStripePaymentForm() {
    
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // create a  card element
    this.cardElement = elements.create('card', { hidePostalCode: true});

    // add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {
      
      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        //show validation error to customer
        this.displayError.textContent = event.error.message;
      }

    })
  }

  // Função para consultar CEP e preencher campos do formulário
  consultarCEPShipping(cep: string) {
    this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe((data: any) => {
      // Preenche campos do formulário com dados do CEP
      this.shippingAddressStreet!.setValue(data.logradouro);
      this.shippingAddressBairro!.setValue(data.bairro);
      this.shippingAddressCity!.setValue(data.localidade);
      this.shippingAddressState!.setValue(data.uf);
    });
  }

  // Função para consultar CEP e preencher campos do formulário
  consultarCEPBilling(cep: string) {
    this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe((data: any) => {
      // Preenche campos do formulário com dados do CEP
      this.billingAddressStreet!.setValue(data.logradouro);
      this.billingAddressBairro!.setValue(data.bairro);
      this.billingAddressCity!.setValue(data.localidade);
      this.billingAddressState!.setValue(data.uf);
    });
  }


  reviewCartDetails() {

    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );


    // subscribe to cartService
      this.cartService.totalPrice.subscribe(
        totalPrice => this.totalPrice = totalPrice
      );
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressZipCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressNumber() { return this.checkoutFormGroup.get('shippingAddress.number'); }
  get shippingAddressComplement() { return this.checkoutFormGroup.get('shippingAddress.complement'); }
  get shippingAddressBairro() { return this.checkoutFormGroup.get('shippingAddress.bairro'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressZipCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressNumber() { return this.checkoutFormGroup.get('billingAddress.number'); }
  get billingAddressComplement() { return this.checkoutFormGroup.get('billingAddress.complement'); }
  get billingAddressBairro() { return this.checkoutFormGroup.get('billingAddress.bairro'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // bug fix for states
      this.billingAddressStates = this.shippingAddressStates;

    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      // bug fix for states
      this.billingAddressStates = [];
    }
  }

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    
    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;


    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from carItems
    // - long way
    // let orderItems: OrderItem[] = [];
    // for (let i = 0; i < cartItems.length; i++) {
    //   orderItems[i] = new OrderItem(cartItems[i]);
    // }

    // - short way of doing the same thing
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));


    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    
    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;

    
    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency ="BRL";
    this.paymentInfo.receiptEmail = purchase.customer?.email;
    //if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === ""){
      
      this.isDisabled = true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
          {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                email: purchase.customer?.email,
                name: `${purchase.customer?.firstName} ${purchase.customer?.lastName}`,
                address: {
                  line1: purchase.billingAddress?.street,
                  city: purchase.billingAddress?.city,
                  state: purchase.billingAddress?.state,
                  postal_code: purchase.billingAddress?.zipCode,
                  country: this.billingAddressZipCountry?.value.code,
                }
              }
            }
          }, { handlerActions: false })
          .then((result: any) => {
            if (result.error) {
              // inform the customer there was an error
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {
              // call REST API via the CheckoutService
              this.checkoutService.placeOrder(purchase).subscribe({
                next: (response: any) => {
                  alert(`Seu pedido foi recebido.\nNúmero de Identificação do Pedido: ${response.orderTrackingNumber}`);
                  
                  // reset cart
                  this.resetCart();
                  this.isDisabled = false;
                },
                error: (err: any) => {
                  alert(`There wan an error: ${err.message}`);
                  this.isDisabled = false;
                }
              })
            }
          });
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // console.log(this.checkoutFormGroup.get('customer')!.value);
    // console.log("The email address is " + this.checkoutFormGroup.get('customer')?.value.email);
    // console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    // console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
    

  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    // rest the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);


    // if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

}
