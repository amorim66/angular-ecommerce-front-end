import { Component } from '@angular/core';
import { ProductService } from './services/product.service';
import { ProductCategory } from './common/product-category';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'angular-ecommerce';
  productCategories: ProductCategory[] = [];

  constructor(private productService: ProductService){}
  
  ngOnInit() {
    this.listProductCategories();
  }

  listProductCategories() {
    
    this.productService.getProductCategories().subscribe(
      data => {
        console.log('Product Categories=' + JSON.stringify(data));
        this.productCategories = data;
      }
    );
  }
}


