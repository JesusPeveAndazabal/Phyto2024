// import { WebSocketClientService } from './core/services/websocket-client/web-socket-client.service';
import { DatabaseService } from './core/services/database/database.service';
import { environment } from './../environments/environment';
import { Component, OnInit } from '@angular/core';
// import { AndroidFullScreen } from "@awesome-cordova-plugins/android-full-screen/ngx";
import { createSchema } from './core/utils/db-schemas';
import { ElectronService } from './core/services';
import { Configuration } from './core/utils/configuration';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './core/services/api/api.service';
import { WorkExecution, WorkExecutionDetail } from './core/models/work-execution';
import { ArduinoDevice } from './core/services/arduino/arduino.device';
import { ArduinoService } from './core/services/arduino/arduino.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
  isWeb = false;
  private initPlugin= false;

  constructor(
    private databaseService : DatabaseService,
    private electronService: ElectronService,
    private apiService : ApiService,
    private arduinoService : ArduinoService) {

      this.databaseService.openConnection();

      if(this.electronService.isElectron){
        let file = electronService.fs.readFileSync(electronService.path.resolve("bd/","conf.env"),{encoding:'utf-8'});

        //Leyendo el archivo de configuración
        file.split(`\r\n`).forEach((el)=>{
          let par = el.split("=");
          switch(par[0]){
            case "TOKEN":
              Configuration.token = par[1];
              break;
            case "URL_REST":
              Configuration.urlRest = par[1];
              break;
            case "N_DEVICES":
              Configuration.nDevices = parseInt(par[1]);
              break;
            case "DEVICE_1":
              Configuration.device1 = par[1];
              break;
            case "DEVICE_2":
              Configuration.device2 = par[1];
              break;
            case "DEVICE_3":
              Configuration.device3 = par[1];
              break;
            case "DEVICE_4":
              Configuration.device4 = par[1];
              break;
          }
        });

        console.log("Configuration",Configuration);
      }
  }

  ngOnInit(): void {
    console.log("App initialization", "app.component.ts");

  }
}
