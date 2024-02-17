import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GpsRoutingModule } from './gps-routing.module';
import { GpsComponent } from './gps.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GpsRoutingModule
  ],
  declarations: [
    GpsComponent,
]
})
export class GpsModule {}
