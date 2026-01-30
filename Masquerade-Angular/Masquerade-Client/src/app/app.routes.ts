import { Routes } from '@angular/router';
import { LobbyComponent } from '../lobby/lobby.component';

export const routes: Routes = [
  {
    path: 'lobby',
    component: LobbyComponent
  },
  {
    path: '',
    redirectTo: 'lobby',
    pathMatch: 'full'
  }
];