import { Component, OnDestroy, OnInit } from '@angular/core';
import { merge, Observable, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './shared/model/service/auth.service';
import { AuthUser } from './shared/model/auth.model';
import { ChatService } from './shared/model/service/chat.service';

const slideAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({ position: 'absolute', width: '100%', opacity: 0 })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('150ms ease-out', style({ opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('200ms 100ms ease-in', style({ opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideAnimation]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'face-login-siteanuncios';
  authState$: Observable<boolean> = this.authService.authState$;
  currentUser$: Observable<AuthUser | null> = this.authService.currentUser$;
  unreadCount = 0;
  mobileMenuOpen = false;
  private unreadSubscription?: Subscription;

  constructor(private authService: AuthService, private chatService: ChatService) {}

  ngOnInit(): void {
    this.authState$.subscribe((loggedIn) => {
      this.unreadSubscription?.unsubscribe();
      this.unreadCount = 0;

      if (loggedIn) {
        this.unreadSubscription = merge(timer(0, 20000), this.chatService.unreadRefresh$)
          .pipe(switchMap(() => this.chatService.contarNaoLidas()))
          .subscribe({
            next: (response) => {
              this.unreadCount = response.total ?? 0;
            },
            error: () => {
              this.unreadCount = 0;
            }
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.unreadSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.mobileMenuOpen = false;
    this.unreadCount = 0;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  getRouteAnimationData(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] ?? outlet?.activatedRoute?.snapshot?.url?.[0]?.path ?? 'page';
  }
}
