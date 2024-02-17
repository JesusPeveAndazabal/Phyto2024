import { mainAuthGuard } from './../core/security/auth.guard';
import { MainComponent } from './main.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children:[
      {
        path: 'control',
        loadChildren: () => import('./control/control.module').then(m => m.ControlModule),
        canActivate: [mainAuthGuard]
      },
      {
        path: 'gps',
        loadChildren: () => import('./gps/gps.module').then(m => m.GpsModule),
        canActivate : [mainAuthGuard]
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: '',
        redirectTo: '/main/control',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({

  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {}
