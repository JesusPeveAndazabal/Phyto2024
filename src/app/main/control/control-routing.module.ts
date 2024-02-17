import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ControlComponent } from './control.component';
// import { MainComponent }from './login.component';


const routes: Routes = [
  {
    path: '',
    component: ControlComponent,
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlRoutingModule {}
