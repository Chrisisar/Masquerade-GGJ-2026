import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../services/app-state.service';
import { GameState } from '../types/game-state.enum';
import { RouterOutlet } from '@angular/router';
import { GameHubService } from '../services/gamehub.service';

interface Player {
  id: string;
  name: string;
  role: string;
  ready: boolean;
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements OnInit {
  public players = signal<Player[]>([]);
  currentPlayerId = 'player1';
  currentPlayerReady = false;
  private appState = inject(AppStateService);
  private svc = inject(GameHubService);

  constructor(private router: Router) { 
  }

  ngOnInit(): void {
    this.svc.connect(this.currentPlayerId);   
    this.svc.onReceivePlayersInTheRoom().subscribe(msg => 
      this.players.set(msg.map((name, i) => ({ id: `player${i}`, name, role: 'Mask Maker', ready: false }))
    ));
    // use getAllGameIds method from GameHubService to find all game ids
    this.svc.getAllGameIds();
    //this.initializePlayers();
    
  }

  private joinMainGameRoom(): void {

  }


  toggleReady(): void {
    const currentPlayer = this.players().find(p => p.id === this.currentPlayerId);
    if (currentPlayer) {
      currentPlayer.ready = !currentPlayer.ready;
      this.currentPlayerReady = currentPlayer.ready;
    }

    // If all players are ready, navigate to mask creator
    if (this.allPlayersReady) {
      setTimeout(() => {
        this.appState.setState(GameState.MASK_DRAW);
      }, 800);
    }
  }

  get allPlayersReady(): boolean {
    return this.players().length > 0 && this.players().every(p => p.ready);
  }

  get readyCount(): number {
    return this.players().filter(p => p.ready).length;
  }

  leaveGame(): void {
    // TODO: Handle leaving game
    console.log('Player left the game');
  }

  sendMessage(message: string): void {
    // TODO: Implement chat functionality
    console.log('Message sent:', message);
  }
}
