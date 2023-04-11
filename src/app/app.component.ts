import { Component } from '@angular/core';
import { ProductService } from './services/product.service';
import { ProductCategory } from './common/product-category';
import { CargarScriptsService } from './cargar-scripts.service';
import { AccessibilityService } from './services/accessibility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  title = 'angular-ecommerce';
  productCategories: ProductCategory[] = [];

  constructor(private productService: ProductService, private accessibilityService: AccessibilityService , private _CargaScripts:CargarScriptsService ){
    _CargaScripts.Carga(["script"]);
  }
  
  ngOnInit() {
    this.listProductCategories();
  }

  public increaseFontSize() {
    this.accessibilityService.increaseFontSize();
  }

  public decreaseFontSize() {
    this.accessibilityService.decreaseFontSize();
  }

  listProductCategories() {
    
    this.productService.getProductCategories().subscribe(
      data => {
        console.log('Product Categories=' + JSON.stringify(data));
        this.productCategories = data;
      }
    );
  }

  goToProcucts(){
    // Obter o elemento HTML que contém os resultados da pesquisa
    const mainProducts = document.getElementById('product-main');

    // Rolar suavemente até o elemento dos resultados da pesquisa
    mainProducts!.scrollIntoView({ behavior: 'smooth' });
  }
}


