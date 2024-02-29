import { GeneralService } from './../core/services/general/general.service';
import { DatabaseService } from './../core/services/database/database.service';
import { PersonType } from './../core/utils/global';
import { Person } from './../core/models/person';
// import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { IonLoading } from '@ionic/angular';
// import { environment } from '../../environments/environment';
// import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { ElectronService } from '../core/services';
import { WorkExecution } from '../core/models/work-execution';
// import { WorkExecutionConfiguration } from '../core/models/we-configuration';
// import { WorkExecution } from '../core/models/work-execution';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation : ViewEncapsulation.None,
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  // @ViewChild('loader') loader!: IonLoading;
  loading_message: string = "Sincronizando...";
  formData!: FormGroup;
  personData: Array<Person> = [];
  workExecution : WorkExecution;
  // currentWorkExecution : WorkExecution | undefined = undefined;
  constructor(private fb:FormBuilder,
    private dbService : DatabaseService,
    private generalService:GeneralService,
    private databaseService:DatabaseService,
    private electronService : ElectronService,
    private router:Router,
    private apiService:GeneralService,
    private toastController: ToastController) {
    this.formData = this.fb.group({
      code: ['',[Validators.required]],
      supervisor: ['',[Validators.required]],
    });
  }

  async ngOnInit() {
    // console.log("info correcta login.component.ts");
    // this.databaseService.openConnection();
    await this.dbService.openConnection();
    this.personData = await this.dbService.getPersonData();
    this.workExecution = await this.dbService.getLastWorkExecution();
    // console.log(this.workExecution, "work execution 123");

  }

  public get supervisors() : Person[] {
    // console.log(this.personData.filter(p => p.type == PersonType.SUPERVISOR), "personData1");
    return this.personData.filter(p => p.type == PersonType.SUPERVISOR)
  }

  async ngAfterViewInit() {
    // await this.loader.present();

    await this.databaseService.openConnection();
  }

  async login(){
    // console.log(this.formData.valid, "login");
    //console.log("Ingreso al login : 1 vez");
    if(this.formData.valid){
      //console.log("Ingreso a la condicion");
      // console.log(this.personData.find(person => (person.code == this.formData.value.code)), "personData2");
      // console.log(firstValueFrom(this.apiService.getPeople(environment.token)), "personData2");
      if(this.personData.find(person => (person.code == this.formData.value.code
        || person.document == this.formData.value.code) && person.type == PersonType.OPERADOR))
      {

      await this.databaseService.saveLogin(this.formData.value.code, this.formData.value.supervisor);
      this.router.navigateByUrl('/main');
      }
      else{
        this.presentToast("middle");
      }
    }
  }


  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'No existe operador!',
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

}
