import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.component.html',
  styleUrls: ['./pesquisa.component.scss']
})
export class PesquisaComponent implements OnInit {
  termo = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.termo = params['q'] || '';
    });
  }

  pesquisar(): void {
    const q = this.termo.trim();
    this.router.navigate(['/'], {
      queryParams: q ? { q } : {}
    });
  }
}
