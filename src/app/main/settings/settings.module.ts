import { CustomComponentsModule } from './../../custom-components/custom-components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { DropdownModule } from 'primeng/dropdown';
import { OrderListModule } from 'primeng/orderlist';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { ApplicationDataComponent } from './application-data/application-data.component';
import { ApplicationValuesComponent } from './application-values/application-values.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogService } from 'primeng/dynamicdialog';

// import { HeaderModule } from 'primeng/header';
// import { CustomComponentsModule } from 'src/app/custom-components/custom-components.module';
@NgModule({
  imports: [
    // ProgressSpinnerModule,
    // OverlayPanelModule,
    // DialogService,
    DialogModule,
    ToolbarModule,
    ButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SettingsRoutingModule,
    CustomComponentsModule,
    DropdownModule,
    OrderListModule,
    InputNumberModule
  ],
  declarations: [
    SettingsComponent,
    ApplicationDataComponent,
    ApplicationValuesComponent
]
})
export class SettingsModule {}
