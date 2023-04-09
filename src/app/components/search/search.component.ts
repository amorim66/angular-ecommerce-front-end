import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  
  constructor(private router: Router){}

  ngOnInit() {
  }

  doSearch(value: String){
    console.log(`value=${value}`);
    this.router.navigateByUrl(`/search/${value}`);
    // Obter o elemento HTML que contém os resultados da pesquisa
    const searchResults = document.getElementById('product-main');

    // Rolar suavemente até o elemento dos resultados da pesquisa
    searchResults!.scrollIntoView({ behavior: 'smooth' });
  }

}
