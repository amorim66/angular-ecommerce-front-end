import { Product } from "./product";

export class CartItem {

    id: number;
    name: string;
    imageUrl: string;
    alt: string;
    unitPrice: number;
    quantity: number;

    constructor(product: Product){
        this.id = product.id;
        this.name = product.name;
        this.imageUrl = product.imageUrl;
        this.unitPrice = product.unitPrice;
        this.alt = product.alt;
        this.quantity = 1;
    }
}
