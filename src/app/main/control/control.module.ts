import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ControlComponent } from './control.component';
import { ControlRoutingModule } from './control-routing.module';
import { SpeedometerComponent } from './speedometer/speedometer.component';
import { ThermometerComponent } from './thermometer/thermometer.component';
import { WaterFlowComponent } from './water-flow/water-flow.component';
import { PressureComponent } from './pressure/pressure.component';
import { VolumeComponent } from './volume/volume.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ControlRoutingModule
  ],
  declarations: [
    ControlComponent,
    SpeedometerComponent,
    ThermometerComponent,
    WaterFlowComponent,
    PressureComponent,
    VolumeComponent
]
})
export class ControlModule {}
