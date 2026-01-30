import { Routes } from '@angular/router';
import { LobbyComponent } from '../lobby/lobby.component';
import { MaskCreatorComponent } from '../mask-creator/mask-creator.component';
import { MaskComparisonComponent } from '../mask-comparison/mask-comparison.component';
import { ScoringComponent } from '../mask-comparison/scoring/scoring.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lobby',
    pathMatch: 'full'
  },
  {
    path: 'lobby',
    component: LobbyComponent
  },
  {
    path: 'mask-creator',
    component: MaskCreatorComponent
  },
  {
    path: 'mask-comparison',
    component: MaskComparisonComponent
  },
  {
    path: 'scoring',
    component: ScoringComponent
  }
  
];