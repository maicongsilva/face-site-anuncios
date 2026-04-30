import { Component, OnInit } from '@angular/core';
import { ChatThread } from '../shared/model/chat-thread.model';
import { ChatService } from '../shared/model/service/chat.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  conversas: ChatThread[] = [];
  loading = true;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.listarConversas().subscribe({
      next: (conversas) => {
        this.conversas = conversas;
        this.loading = false;
      },
      error: () => {
        this.conversas = [];
        this.loading = false;
      }
    });
  }
}
