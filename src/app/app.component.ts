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
    private apiService : ApiService) {

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
      }
  }

  ngOnInit(): void {
    console.log("App initialization", "app.component.ts");

      let records = [];
      let records1 = [];
      let sended = [];
      let onExecution = false; //Variable de control que evita envíos duplicados y sobre carga del tráfico.

      setInterval(()=>{
        if(!onExecution){
          onExecution = true;

          //Loop que envía los registros por guardar en el servidor vía API/REST
          const iteration = async () =>{
            this.databaseService.getNotSendedExecution().then(async (records)=>{
              console.log("records execution " , records);
              records.forEach(async (wExecution : WorkExecution) => {
                try{
                  let response = await firstValueFrom(this.apiService.sendRegistroAsyncExecution(wExecution));
                  console.log("Impresion de el" , wExecution);
                  if(response.id){
                    if(response.id > 0 || response.id == -1){
                      wExecution.id_from_server = response.id;
                      let workExecutionEnviado = await this.databaseService.updateExecutionSended(wExecution);
                      

                      let nonSendedExecutionDetail = await this.databaseService.getNotSendedExecutionDetail(wExecution.id)
                      nonSendedExecutionDetail.forEach(async (wDetail : WorkExecutionDetail) => {
                        try{
                          wDetail.data = JSON.parse(wDetail.data);
                          wDetail.gps = JSON.parse(wDetail.gps);
                          wDetail.work_execution = wExecution.id_from_server;
                          let response = await firstValueFrom(this.apiService.sendRegistroAsyncExecutionDetail(wDetail));
                          if(response.id){
                            if(response.id > 0 || response.id == -1){
                              await this.databaseService.updateExecutionSendedDetail(wDetail);
                            }
                          }
        
                        }catch(exception){
                          console.log(exception);
                        }
                      });
                    }
                  }
                }catch(exception){
                  console.log(exception);
                }
              });

            }).catch((err)=>{
              console.log(err)

            });

            

            onExecution = false;
            records = [];
            records1 = [];
            sended = [];
          };


          
        iteration();

        }
      },9000);
  }
}
