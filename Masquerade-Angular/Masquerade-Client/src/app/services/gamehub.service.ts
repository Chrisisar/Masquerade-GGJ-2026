// ...existing code...
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';

export interface UserEvent {
  connectionId: string;
  username?: string | null;
}

@Injectable({ providedIn: 'root' })
export class GameHubService {
  private baseUrl = 'https://localhost:44330';
  private username = 'Player';
  private connection?: HubConnection;
  private userJoined$ = new Subject<UserEvent>();
  private userLeft$ = new Subject<UserEvent>();
  private receiveMessage$ = new Subject<string>();
  private receivePlayersInTheRoom$ = new Subject<string[]>();
  private gameId: string = '';

  onUserJoined(): Observable<UserEvent> {
    return this.userJoined$.asObservable();
  }

  onUserLeft(): Observable<UserEvent> {
    return this.userLeft$.asObservable();
  }

  onReceiveMessage(): Observable<string> {
    return this.receiveMessage$.asObservable();
  }

  onReceivePlayersInTheRoom(): Observable<string[]> {
    return this.receivePlayersInTheRoom$.asObservable();
  }

  async connect(username: string): Promise<void> {
    if (this.connection && this.connection.state !== 'Disconnected') {
      return;
    }

    const hubUrl = `${this.baseUrl.replace(/\/$/, '')}/hubs/game?username=${encodeURIComponent(username)}`;

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on('UserJoined', (connectionId: string, name?: string) => {
      this.userJoined$.next({ connectionId, username: name });
    });

    this.connection.on('UserLeft', (connectionId: string, name?: string) => {
      this.userLeft$.next({ connectionId, username: name });
    });

    this.connection.on('ReceiveMessage', (message: string) => {
      this.receiveMessage$.next(message);
    });

    this.connection.on('ReceiveAllGameIds', (ids: string[]) => {
      // Set first id as current gameId 
      if (ids.length > 0) {
        this.gameId = ids[0];
        this.joinGame();
      }
    });
    
    this.connection.on('PlayersInTheRoom', (userNames: string[]) => {
      this.receivePlayersInTheRoom$.next(userNames);
    });

    await this.connection.start();
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.connection) throw new Error('Not connected');
    await this.connection.invoke('SendMessage', message);
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    await this.connection.stop();
  }

  async getAllGameIds() {
    if (!this.connection) throw new Error('Not connected');
    await this.connection.invoke('GetAllGameIds');
  }

  async joinGame() {
    if (!this.connection) throw new Error('Not connected');
    await this.connection.invoke('JoinGame', this.gameId);
  }
}
