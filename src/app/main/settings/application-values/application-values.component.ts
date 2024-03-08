import { DatabaseService } from './../../../core/services/database/database.service';
import { environment } from './../../../../environments/environment';
import { Component, Injectable, OnInit } from '@angular/core';
import { ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { NozzlesConfiguration, WorkExecutionConfiguration,NozzleColor, NozzleType, Nozzles, WorkExecution } from './../../../core/models/models';
import { AlertController } from '@ionic/angular';
import { UnitPressure, UnitPressureEnum,config,convertPressureUnit } from './../../../core/utils/global';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { ArduinoService } from '../../../core/services/arduino/arduino.service';
import { SettingsComponent } from '../settings.component';
//import { SettingsComponent } from '../settings.component';
// import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-application-values',
  templateUrl: './application-values.component.html',
  styleUrls: ['./application-values.component.scss'],
})
export class ApplicationValuesComponent  implements OnInit {
  visible: boolean = true;
  nozzleColors : NozzleColor[] = [];
  nozzleTypes : NozzleType[] = [];
  nozzles : Nozzles[] = [];
  weConfiguration : WorkExecutionConfiguration | undefined;
  nozzleConfig : NozzlesConfiguration[] = [];

  selectedColors: number[] = [];
  quantity : number = 0;
  type : any = 0;
  total : number = 0;
  totalLabel : string ="0 L/min";
  formData!: FormGroup;
  isSubmitted : boolean = false;
  // item: { type: any };

  pressures_items = [{label: "Pressure", value: 0}];

  private pressure_values : any[] = [];
  info: number = 0;
  currentWorkExecution : WorkExecution | undefined = undefined;
  private invalid_rows = 0;

  constructor(private settingsComponent:SettingsComponent, private arduinoService:ArduinoService, private modalCtrl: ModalController, private dbService : DatabaseService,
    private alertController : AlertController,private fb:FormBuilder) {
      this.formData = this.fb.group({
        volume: [0,[Validators.required,]],
        speed: ['',[Validators.required,Validators.min(0.01)]],
        pressure: ['',[Validators.required,Validators.min(0.01)]],
        unit: ['',[Validators.required]],
        width: ['',[Validators.required,Validators.min(0.01)]],
      });
    }

  async ngOnInit() {

    await this.dbService.openConnection();
    this.nozzleColors = await this.dbService.getNozzleColorData();
    this.nozzleTypes = await this.dbService.getNozzleTypeData();
    this.nozzles = await this.dbService.getNozzlesData();

    // console.log(this.nozzleColors, "nozzleColors");
    // console.log(this.nozzleTypes, "nozzleTypes");

    this.pressure_values = this.nozzles.map(p => { return  {pressure : p.pressure, pressure_unit : p.pressure_unit }})
      .filter((obj, index, self) =>
        index === self.findIndex((o) => (
          o.pressure === obj.pressure && o.pressure_unit === obj.pressure_unit
        ))
      );
    // console.log(this.pressure_values, "filtro de nozzles");

    this.currentWorkExecution = await this.dbService.getLastWorkExecution();
    if(this.currentWorkExecution){
      if(this.currentWorkExecution.configuration != ""){
        this.weConfiguration = await JSON.parse(this.currentWorkExecution.configuration);
        this.nozzleConfig = this.weConfiguration!.nozzles;
        this.formData.setValue({
          volume : await this.weConfiguration?.volume,
          speed : await this.weConfiguration?.speed,
          pressure : await this.weConfiguration?.pressure,
          unit: await this.weConfiguration?.unit,
          width : await this.weConfiguration?.width,
        });

        this.changeUnit({value: this.weConfiguration?.unit});

        setTimeout(() => this.updateSummary(null),200);
      }
    }
  }

  set items(items: NozzlesConfiguration[]){
    this.nozzleConfig = items;
    // setTimeout(() => this.updateSummary(null),200);
  }

  get unitsPressure(){
    setTimeout(() => this.updateSummary(null),200);
    return UnitPressure;
  }
  // unitsPressure : any = UnitPressure;



  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel','application-values-modal');
  }

  handleError(controlName : string,errorType : string) : boolean{
    if(this.formData.controls[controlName].errors)
    {
      return this.formData.controls[controlName].errors![errorType];
    }

    return false;
  }

  async confirm() {
    //console.log("Boton confirmar async");
    this.isSubmitted = true;
    if(this.formData.valid){

      if(this.nozzleConfig.length == 0){

        return false;
      }
      else if(this.invalid_rows > 0)
      {

        return false;
      }

      //this.arduinoService.regulatePressureWithBars()
      this.nozzleConfig = this.nozzleConfig.map(p => {return { type : p.type, number : p.number, color : parseInt(p.color.toString()) }});
      this.weConfiguration = {
        nozzles : await this.nozzleConfig,
        water_flow : await this.total,
        humidity : await this.weConfiguration? this.weConfiguration.humidity : 0,
        temperature : await this.weConfiguration? this.weConfiguration.temperature : 0,
        wind_kmh : await this.weConfiguration? this.weConfiguration.wind_kmh : 0,
        ...this.formData.value
      }

      //console.log("Deberria regular" ,this.weConfiguration?.pressure);
      //Esto es para mandar el comando de regulacion desde el confirmar del boton 
      this.arduinoService.regulatePressureWithBars(this.weConfiguration?.pressure);

      let wExecution : WorkExecution ={
        id : this.currentWorkExecution ? this.currentWorkExecution.id : 0,
        configuration : await JSON.stringify(this.weConfiguration),
        date : this.currentWorkExecution ? moment(this.currentWorkExecution.date,'YYYY-MM-DD H:mm:ss') : moment(),
        downtime : this.currentWorkExecution ? moment(this.currentWorkExecution.downtime,'H:mm:ss') :moment('0:00:00', 'H:mm:ss'),
        is_finished : 0,
        working_time : this.currentWorkExecution ? moment(this.currentWorkExecution.working_time,'H:mm:ss') : moment('0:00:00', 'H:mm:ss'),
        worker : this.currentWorkExecution ? this.currentWorkExecution.worker : (await this.dbService.getLogin()).operador,
        supervisor : this.currentWorkExecution ? this.currentWorkExecution.supervisor : (await this.dbService.getLogin()).supervisor,
        cultivation : this.currentWorkExecution ? this.currentWorkExecution.cultivation : 0,
        farm : this.currentWorkExecution ? this.currentWorkExecution.farm : 0,
        hectare : this.currentWorkExecution ? this.currentWorkExecution.hectare : 0,
        lot : this.currentWorkExecution ? this.currentWorkExecution.lot : 0,
        product : this.currentWorkExecution ? this.currentWorkExecution.product : 0,
        work : this.currentWorkExecution ? this.currentWorkExecution.work : 0,
        id_from_server : this.currentWorkExecution ? this.currentWorkExecution.id_from_server : 0,
        execution_from : this.currentWorkExecution ? this.currentWorkExecution.execution_from : 1,
        sended : this.currentWorkExecution ? this.currentWorkExecution.sended : 0,
        min_volume : 0,
      };

      if(!this.currentWorkExecution){
        await this.dbService.saveWorkExecutionData(wExecution)
        .then(async ()=>{
          config.lastWorkExecution = wExecution;
          return this.modalCtrl.dismiss(null, 'confirm','application-values-modal');

        })
        .catch((error)=>{
          console.log(error);
          return false;
        });

      }
      else{
        await this.dbService.updateWorkExecutionData(wExecution)
        .then(async()=>{
          config.lastWorkExecution = wExecution;
          //this.arduinoService.regulatePressureWithBars(this.settingsComponent.info);
          return this.modalCtrl.dismiss(null, 'confirm','application-values-modal');

        })
        .catch((error)=>{
          console.log(error);
          return false;
        });
      }
    }
    return false;
  }

  getColorCode(id: number): string {
    const color = this.nozzleColors.find(c => c.id === id);
    //console.log("Color" , color);
    return color ? color.code : 'transparent'; // Devuelve el código del color si se encuentra, de lo contrario, devuelve 'transparent'
  }
  	
  
  handleReorder() {
    //Reorder and changing number of nozzles to new order
    this.nozzleConfig.forEach((item,index) => { item.number = index +1; });
  }

  addNozzles(){
    if(!this.quantity)
      return;
    for(let i = 0; i < this.quantity; i++)
      this.nozzleConfig = [...this.nozzleConfig,{number : (this.nozzleConfig.length+1) , type : parseInt(this.type) , color : 0}];
      // console.log(this.nozzleConfig, "addNozzles");
    setTimeout(() => this.updateSummary(null),200);
  }

  /**
   * This function is responsible for removing a specific nozzle from the nozzle configuration.
   * It prompts the user with an alert message asking them to confirm if they want to delete the nozzle with the given number.
   * If the user confirms, the nozzle is removed from the configuration and the handleReorder() and updateSummary() functions are called to update the UI.
   * If the user cancels, nothing happens.
   * @param nozzleNumber
   */
  removeNozzle(nozzleNumber : number){
    this.alertController.create({
      header: '¡Atención!',
      subHeader: 'Borrar boquilla',
      message: `¿Está seguro que desea borrar la boquilla N° ${nozzleNumber}?`,
      buttons: [
        {
          text: 'Si',
          handler: () => {
            this.nozzleConfig = this.nozzleConfig.filter(p => p.number != nozzleNumber);
            this.handleReorder();
            this.updateSummary(null);
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('Let me think');
          }
        },
      ]
    }).then((res) => {
      res.present();
    });
  }

  // isNullOrNaN(value: number | undefined,nonNullValue : number,item : number) : number {
  //   if(isNaN(value!)){
  //     this.invalid_rows++;
  //     document.getElementById(`row_${item}`)!.setAttribute("style","--background: #ff000057;") ;
  //   }
  //   else{
  //     document.getElementById(`row_${item}`)!.setAttribute("style","--background: transparent;") ;
  //   }

  //   return !isNaN(value!) ? value! : nonNullValue;
  // }
  isNullOrNaN(value: number | undefined, nonNullValue: number, item: number): number {
    if (isNaN(value!)) {
      this.invalid_rows++;
      const rowElement = document.getElementById(`row_${item}`);
      if (rowElement) {
        rowElement.setAttribute("style", "--background: #ff000057;");
      }
    } else {
      const rowElement = document.getElementById(`row_${item}`);
      if (rowElement) {
        rowElement.setAttribute("style", "--background: transparent;");
      }
    }

    return !isNaN(value!) ? value! : nonNullValue;
  }


  /**
   * The below code is a function that updates the total flow rate of all nozzles based on their configuration and current flow rate.
   * It does this by first mapping the nozzle configuration to their respective flow rates using the find method to match nozzle color and type.
   * Any nozzle with a null or NaN value is replaced with 0. The mapped values are then summed up using the reduce method and displayed as a string with the label "L/min".
   * @param _event
   */
  updateSummary(_event : any){
    this.invalid_rows = 0;
    // console.log(this.nozzleConfig, "updateSummary");
    if(this.nozzleConfig.length > 0)
      this.total = this.nozzleConfig
        .map(p => this.isNullOrNaN(this.nozzles.find(x => x.color == p.color && x.type == p.type && x.pressure == this.formData.value.pressure)?.flow,0,p.number))
        .reduce((a,b)=>{ return a + b; },);

    else
      this.total = 0;

    this.totalLabel = `${this.total.toFixed(1)} L/min`;
  }

  changeUnit($event : any){
    // console.log("cambio de item");
    this.pressures_items = [];
    this.pressure_values.forEach((item : any) =>{
      let original = UnitPressure.find(p => p.value == item.pressure_unit);
      let convert_unit = UnitPressure.find(p => p.value == $event.value);
      let converted = parseFloat(convertPressureUnit(item.pressure,item.pressure_unit,$event.value).toFixed(2));
      this.pressures_items.push({label: `${converted} ${convert_unit!.name} (${item.pressure} ${original!.name})`,value : item.pressure})

    });

    // console.log(info, "changeUnit");
  }
}
