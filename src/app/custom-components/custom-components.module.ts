import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectFilterComponent } from './select-filter/select-filter.component';
import { IonSearchbar, IonicModule } from '@ionic/angular';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [
    SelectFilterComponent
  ],
  exports : [
    SelectFilterComponent
  ]
})
export class CustomComponentsModule {}
