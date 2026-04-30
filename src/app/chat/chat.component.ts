import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ChatMessage } from '../shared/model/chat.model';
import { ChatService } from '../shared/model/service/chat.service';
import { AuthService } from '../shared/model/service/auth.service';

export interface MessageGroup {
  remetenteNome: string;
  remetenteId: number | undefined;
  minha: boolean;
  mensagens: ChatMessage[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  anuncioId: number | null = null;
  participanteId: number | null = null;
  mensagens: ChatMessage[] = [];
  loading = true;
  feedback = '';
  currentUserId = this.authService.getCurrentUser()?.id;
  private refreshSubscription?: Subscription;

  form = this.fb.group({
    conteudo: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] })
  });

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.anuncioId = Number(this.route.snapshot.paramMap.get('id'));
    this.participanteId = Number(this.route.snapshot.queryParamMap.get('usuario')) || null;

    if (!this.anuncioId) {
      this.loading = false;
      return;
    }

    this.carregarMensagens();
    this.refreshSubscription = timer(15000, 15000).subscribe(() => this.carregarMensagens(true));
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  get groupedMessages(): MessageGroup[] {
    const groups: MessageGroup[] = [];
    for (const msg of this.mensagens) {
      const last = groups[groups.length - 1];
      if (last && last.remetenteId === msg.remetenteId) {
        last.mensagens.push(msg);
      } else {
        groups.push({
          remetenteNome: msg.remetenteNome,
          remetenteId: msg.remetenteId,
          minha: msg.remetenteId === this.currentUserId,
          mensagens: [msg]
        });
      }
    }
    return groups;
  }

  enviar(): void {
    if (!this.anuncioId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const conteudo = this.form.getRawValue().conteudo;
    this.chatService.enviarMensagem(this.anuncioId, conteudo, this.participanteId || undefined).subscribe({
      next: (mensagem) => {
        this.mensagens = [...this.mensagens, mensagem];
        this.form.reset({ conteudo: '' });
        this.feedback = 'Mensagem enviada com sucesso.';
        this.chatService.notifyUnreadRefresh();
      },
      error: () => {
        this.feedback = 'Não foi possível enviar a mensagem agora.';
      }
    });
  }

  isMinhaMensagem(mensagem: ChatMessage): boolean {
    return mensagem.remetenteId === this.currentUserId;
  }

  private carregarMensagens(silent = false): void {
    if (!this.anuncioId) {
      return;
    }

    this.chatService.listarMensagens(this.anuncioId, this.participanteId || undefined).subscribe({
      next: (mensagens) => {
        this.mensagens = mensagens;
        this.loading = false;
        this.chatService.notifyUnreadRefresh();
      },
      error: () => {
        if (!silent) {
          this.feedback = 'Você ainda não possui mensagens neste anúncio.';
        }
        this.loading = false;
      }
    });
  }
}
