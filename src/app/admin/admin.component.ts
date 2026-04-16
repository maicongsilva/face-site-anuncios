import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDashboard } from '../shared/model/admin.model';
import { AuthService } from '../shared/model/service/auth.service';
import { AdminService } from '../shared/model/service/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  dashboard: AdminDashboard | null = null;
  loading = true;
  feedback = '';

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      this.router.navigate(['/minha-conta']);
      return;
    }

    this.adminService.carregarDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      error: () => {
        this.feedback = 'Não foi possível carregar o painel admin agora.';
        this.loading = false;
      }
    });
  }
}
