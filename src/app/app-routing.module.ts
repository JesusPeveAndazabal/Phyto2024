import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules,NoPreloading } from '@angular/router';
import { LoginRoutingModule } from './login/login-routing.module';
// import { environment } from '../environments/environment';
import { ConfigRoutingModule } from './config/config-routing.module';
import { MainRoutingModule } from './main/main-routing.module';
import { authGuard, configAuthGuard } from './core/security/auth.guard';
import { environment } from '../environments/environment';
import { LoginModule } from './login/login.module';
import { MainModule } from './main/main.module';
//import { ConfigComponentModule } from './config/config.module';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginModule),
    canActivate : [configAuthGuard],
    canActivateChild : [configAuthGuard]

  },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then( m => m.MainModule),
    canActivate : [authGuard],
    canActivateChild : [authGuard]
  },
  {
    path: 'config',
    loadChildren: () => import('./config/config.module').then( m => m.ConfigComponentModule)
  },


  // {
  //   path: '',
  //   redirectTo: 'main',
  //   pathMatch: 'full',
  // },
  // {
  //   path: 'login',
  //   component: LoginComponent,
  //   children:[
  //     {
  //       loadChildren: () => import('./login/login.module').then( m => m.LoginModule),

  //     }
  //   ]
  //   // canActivate : [configAuthGuard],
  //   // canActivateChild : [configAuthGuard]

  // },
  // {
  //   path: 'main',
  //   component: MainComponent,
  //   children:[
  //     {
  //       loadChildren: () => import('./main/main.module').then( m => m.MainModule),
  //     }
  //   ]
  //   // canActivate : [authGuard],
  //   // canActivateChild : [authGuard]

  // },
  // {
  //   path: 'config',
  //   component: ConfigComponent,
  //   children:[
  //     {
  //       loadChildren: () => import('./config/config.module').then( m => m.ConfigComponentModule)

  //     }
  //   ]
  // },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
