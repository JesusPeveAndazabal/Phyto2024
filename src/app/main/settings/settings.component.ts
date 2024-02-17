import { DialogService } from 'primeng/dynamicdialog';
import { GeneralService } from './../../core/services/general/general.service';
import { DatabaseService } from './../../core/services/database/database.service';
import { environment } from './../../../environments/environment';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { IonLoading, ModalController } from '@ionic/angular';
import { ApplicationValuesComponent } from './application-values/application-values.component';
import { ApplicationDataComponent } from './application-data/application-data.component';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ArduinoService } from '../../core/services/arduino/arduino.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent  implements OnInit {
  @ViewChild('loader') loader!: IonLoading;
  loading_message : string = 'Sincronizando datos...';
  info: number = 0;

  constructor(private arduinoService:ArduinoService, private modalCtrl: ModalController,private router: Router,
    private dbService : DatabaseService,private apiService : GeneralService) { }

  async ngOnInit() {
    this.dbService.getLocalConfig();
    this.dbService.getLastWorkExecution();
    this.info = +JSON.parse((await this.dbService.getLastWorkExecution()).configuration).pressure;
    console.log(this.info, "INFOOOOOO");
  }

  public mostrarAlertaChica(html){
    Swal.fire({
      width: 500,
      showCloseButton: true,
      showConfirmButton: false,
      html: "<h4>Control Phytosanitary</h4><br>" + html,
      timer: 1400,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  }

  async openAplicationValues() {
    const modal = await this.modalCtrl.create({
      component: ApplicationValuesComponent,
      id: 'application-values-modal'
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }
  async openAplicationData() {
    const modal = await this.modalCtrl.create({
      component: ApplicationDataComponent,
      id : 'application-data-modal'
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
  }

  /**
   * This function gets data from the main server and store to local database.
   * The data will be used to settings the work executions.
   */

  async syncPrimaryTables() : Promise<boolean>{
    this.loading_message = "Verificando url del API...";
    console.log(await firstValueFrom(this.apiService.getPeople(environment.token)), "config.component.ts");
    try{
      // await this.dbService.openConnection();
      const people = await firstValueFrom(this.apiService.getPeople(environment.token));
      const cultivations = await firstValueFrom(this.apiService.getCultivations());
      const farms = await firstValueFrom(this.apiService.getFarm());
      const lots = await firstValueFrom(this.apiService.getLots());
      const nozzleColors = await firstValueFrom(this.apiService.getNozzleColors());
      const nozzleTypes = await firstValueFrom(this.apiService.getNozzleTypes());
      const nozzles = await firstValueFrom(this.apiService.getNozzles());
      const products = await firstValueFrom(this.apiService.getProducts());
      const works = await firstValueFrom(this.apiService.getWorks());
      // const we = await firstValueFrom(this.apiService.getWE());

      await this.dbService.openConnection();  // Asegúrate de abrir la conexión antes de guardar

      // await this.dbService.syncPersonData(people);
      for (const person of people) {
        const existingPerson = await this.dbService.getRecordById('person', person.id);
        // console.log(existingPerson, "person");
        if (!existingPerson) {
          await this.dbService.syncPersonData([person]);
        }
      }

      // await this.dbService.syncCultivationData(cultivations);
      for (const cultivation of cultivations) {
        const existingCultivation = await this.dbService.getRecordById('cultivation', cultivation.id);
        if (!existingCultivation) {
          await this.dbService.syncCultivationData([cultivation]);
        }
      }

      // await this.dbService.syncFarmData(farms);
      for (const farm of farms) {
        const existingFarm = await this.dbService.getRecordById('farm', farm.id);
        if (!existingFarm) {
          await this.dbService.syncFarmData([farm]);
        }
      }

      // await this.dbService.syncLotsData(lots);
      for (const lot of lots) {
        const existingLot = await this.dbService.getRecordById('lot', lot.id);
        if (!existingLot) {
          await this.dbService.syncLotsData([lot]);
        }
      }

      // await this.dbService.syncNozzleColorData(nozzleColors);
      for (const nozzleColor of nozzleColors) {
        const existingNozzleColor = await this.dbService.getRecordById('nozzle_color', nozzleColor.id);
        if (!existingNozzleColor) {
          await this.dbService.syncNozzleColorData([nozzleColor]);
        }
      }

      // await this.dbService.syncNozzleTypeData(nozzleTypes);
      for (const nozzleType of nozzleTypes) {
        const existingNozzleType = await this.dbService.getRecordById('nozzle_type', nozzleType.id);
        if (!existingNozzleType) {
          await this.dbService.syncNozzleTypeData([nozzleType]);
        }
      }

      // await this.dbService.syncNozzlesData(nozzles);
      for (const nozzle of nozzles) {
        const existingNozzle = await this.dbService.getRecordById('nozzles', nozzle.id);
        if (!existingNozzle) {
          await this.dbService.syncNozzlesData([nozzle]);
        }
      }

      // await this.dbService.syncProductData(products);
      for (const product of products) {
        const existingProduct = await this.dbService.getRecordById('product', product.id);
        if (!existingProduct) {
          await this.dbService.syncProductData([product]);
        }
      }

      // await this.dbService.syncWorkData(works);
      for (const work of works) {
        const existingWork = await this.dbService.getRecordById('work', work.id);
        if (!existingWork) {
          await this.dbService.syncWorkData([work]);
        }
      }
      this.router.navigate(['/main']);
      console.log(this.info, "valor del info");
      let data = +this.info;
      this.arduinoService.regulatePressureWithBars(data);
      return true;
    }catch(err : any){
      console.error("Error during synchronization:", err);
      return false;
    }
    finally{
      console.log("aquí debería cerrarse la base de datos");
      // await this.dbService.closeDB();
    }
  }

  async generalSettings(){
    this.router.navigate(['/config'], { state: { update : true } });
  }
}

