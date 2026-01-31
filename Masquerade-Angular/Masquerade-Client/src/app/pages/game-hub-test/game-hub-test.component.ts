import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

@Component({
  selector: 'app-game-hub-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:16px">
      <h2>GameHub Test</h2>

      <label>Server URL: <input [(ngModel)]="serverUrl" style="width:360px"/></label><br/>
      <label>Username: <input [(ngModel)]="username"/></label><br/>
      <div style="margin:8px 0">
        <button (click)="connect()">Connect</button>
        <button (click)="disconnect()">Disconnect</button>
        <button (click)="clearLogs()">Clear Logs</button>
      </div>

      <fieldset style="margin:8px 0;padding:8px">
        <legend>Game Actions</legend>
        <label>GameId: <input [(ngModel)]="gameId"/></label>
        <button (click)="joinGame()">JoinGame</button>
        <button (click)="leaveGame()">LeaveGame</button>
        <button (click)="triggerPhase()">Invoke PhaseChanged</button>
        <!-- added button to request all game ids -->
        <button (click)="getAllGameIds()">GetAllGameIds</button>
      </fieldset>

      <fieldset style="margin:8px 0;padding:8px">
        <legend>Drawing</legend>
        <label>Encoded drawing: <input [(ngModel)]="encodedDrawing" style="width:360px"/></label>
        <button (click)="submitDrawing()">Submit Drawing</button>
      </fieldset>

      <div style="margin-top:12px">
        <strong>Log:</strong>
        <pre style="height:260px;overflow:auto;border:1px solid #ccc;padding:8px">{{logs}}</pre>
      </div>
    </div>
  `
})
export class GameHubTestComponent implements OnDestroy {
  serverUrl = 'https://localhost:5001';
  username = 'angular';
  gameId = '';
  encodedDrawing = '';
  logs = '';

  private connection?: HubConnection;

  constructor(private cdr: ChangeDetectorRef) {}

  private log(msg: string) {
    this.logs = `${new Date().toISOString()} — ${msg}\n` + this.logs;
    this.cdr.detectChanges();
  }

  private hubUrl() {
    return `${this.serverUrl.replace(/\/$/, '')}/hubs/game?username=${encodeURIComponent(this.username)}`;
  }

  async connect() {
    try {
      if (this.connection && this.connection.state !== 'Disconnected') {
        this.log('Already connected');
        return;
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl())
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      this.connection.on('UserJoinedGame', (connectionId: string, name?: string) => {
        this.log(`UserJoinedGame: ${connectionId} ${name || ''}`);
      });

      this.connection.on('UserLeftGame', (connectionId: string, name?: string) => {
        this.log(`UserLeftGame: ${connectionId} ${name || ''}`);
      });

      this.connection.on('UserJoinedGameGroup', (connectionId: string, name?: string, gameId?: string) => {
        this.log(`UserJoinedGameGroup: ${connectionId} ${name || ''} game:${gameId || ''}`);
      });

      this.connection.on('UserLeftGameGroup', (connectionId: string, name?: string, gameId?: string) => {
        this.log(`UserLeftGameGroup: ${connectionId} ${name || ''} game:${gameId || ''}`);
      });

      this.connection.on('PhaseChanged', (phase: any, payload?: any) => {
        this.log(`PhaseChanged: ${JSON.stringify(phase)} payload=${JSON.stringify(payload)}`);
      });

      // Handler for GetAllGameIds response
      this.connection.on('ReceiveAllGameIds', (ids: string[]) => {
        this.log(`ReceiveAllGameIds: ${JSON.stringify(ids)}`);
      });

      await this.connection.start();
      this.log('Connected to GameHub');
    } catch (e) {
      this.log('Connect error: ' + (e as any));
    }
  }

  async disconnect() {
    try {
      if (!this.connection) {
        this.log('Not connected');
        return;
      }
      await this.connection.stop();
      this.log('Disconnected');
      this.connection = undefined;
    } catch (e) {
      this.log('Disconnect error: ' + (e as any));
    }
  }

  async joinGame() {
    if (!this.connection) { this.log('Not connected'); return; }
    try {
      await this.connection.invoke('JoinGame', this.gameId);
      this.log(`Invoke JoinGame(${this.gameId})`);
    } catch (e) {
      this.log('JoinGame error: ' + (e as any));
    }
  }

  async leaveGame() {
    if (!this.connection) { this.log('Not connected'); return; }
    try {
      await this.connection.invoke('LeaveGame');
      this.log(`Invoke LeaveGame()`);
    } catch (e) {
      this.log('LeaveGame error: ' + (e as any));
    }
  }

  async submitDrawing() {
    if (!this.connection) { this.log('Not connected'); return; }
    try {
      await this.connection.invoke('DrawingReady', this.encodedDrawing);
      this.log(`Invoke DrawingReady (encoded length ${this.encodedDrawing?.length || 0})`);
    } catch (e) {
      this.log('DrawingReady error: ' + (e as any));
    }
  }

  async triggerPhase() {
    if (!this.connection) { this.log('Not connected'); return; }
    try {
      // Attempt to invoke PhaseChanged on server for testing; server expects a GUID
      await this.connection.invoke('PhaseChanged', this.gameId);
      this.log(`Invoke PhaseChanged(${this.gameId})`);
    } catch (e) {
      this.log('PhaseChanged error: ' + (e as any));
    }
  }

  // Invoke server method to request all game ids; response arrives via ReceiveAllGameIds
  async getAllGameIds() {
    if (!this.connection) { this.log('Not connected'); return; }
    try {
      await this.connection.invoke('GetAllGameIds');
      this.log('Invoke GetAllGameIds()');
    } catch (e) {
      this.log('GetAllGameIds error: ' + (e as any));
    }
  }

  clearLogs() { this.logs = ''; }

  ngOnDestroy(): void {
    if (this.connection) {
      this.connection.stop().catch(() => {});
      this.connection = undefined;
    }
  }
}
