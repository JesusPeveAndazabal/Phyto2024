// arduino.service.ts
import { Injectable } from '@angular/core';
import { SerialPort} from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline'
import { ElectronService } from '../electron/electron.service';
import { ArduinoDevice } from './arduino.device';
import { Subject, Observable } from 'rxjs';
import { Sensor, SocketEvent, WorkStatusChange } from '../../utils/global';
import { DatabaseService  } from '../database/database.service';
import { Chronos } from '../../utils/utils';
import { Database, sqlite3 } from 'sqlite3';
import { Product } from '../../models/product';
import { Mode } from '../../utils/global';
import { devices } from 'playwright';
import { start } from 'repl';
import { Configuration } from '../../utils/configuration';
import * as moment from 'moment';
import { LocalConf } from '../../models/local_conf';
import { WorkExecution , WorkExecutionDetail } from '../../models/work-execution';

//Este se comporta como el device_manager

@Injectable({
  providedIn: 'root',
})

export class ArduinoService {
  listArduinos : ArduinoDevice[] = [];
  public tiempoProductivo : Chronos = new Chronos(1,"Productivo", false);
  public tiempoImproductivo : Chronos = new Chronos(2,"Improductivo", false);
  localConfig! : LocalConf;
  minVolume = 0;
  initialVolume: number = 0; // Valor inicial del contenedor
  currentRealVolume: number = this.initialVolume; // Inicializa con el valor inicial
  timer: any;
  currentTime: number = 0;


/*   cronometroActivo: boolean = false;
  tiempoProductivo: number = 0;
  tiempoImproductivo: number = 0;
  inicioTiempoProductivo: number = 0;
  inicioTiempoImproductivo: number = 0; */
  now = moment();
   // Otros atributos necesarios para tu lógica


  detail_number = 0;
  DEBUG = true;
  devicesCant : string[] = [];
  //messages_from_device = [];

  private messageInterval:any;

  private last_date = new Date();

  izquierdaActivada = false;
  derechaActivada = false;

  isRunning: boolean = false;

  timerProductive: any;
  currentTimeProductive: number = 0;

  timerImproductive: any;
  currentTimeImproductive: number = 0;
  data : any = {};


  inputPressureValue: number | undefined;
  lastVolume: number | null = null;

  // private sensorSubjectMap: Map<Sensor, Subject<Sensor>> = new Map();
  private sensorSubjectMap: Map<Sensor, Subject<number|number[]>> = new Map();

  constructor( private electronService: ElectronService , private databaseService : DatabaseService) {
    this.setupSensorSubjects();

    for(let i = 1; i <= Configuration.nDevices; i++){
      this.listArduinos.push(
        new ArduinoDevice(Configuration[`device${i}`],115200,true,electronService)
      );
    }

    //Iteracion para recorre los valores de los sensores y guardarlos localmente
    let instance = this;
    setInterval(async ()=>{
      let onExecution = false;

      //Agregar sensores para futuros cambios 
      this.data = {
        ...this.data,
        [Sensor.PH]:0,
        [Sensor.TEMPERATURE]:0,
        [Sensor.HUMIDITY]:0,
        [Sensor.VOLUME_CONTAINER]:0,
      }

      this.listArduinos.forEach( arduino => {
        arduino.message_from_device.forEach((sensor)=>{
        });
        this.data = {...this.data,...this.mapToObject(arduino.message_from_device)};
        arduino.message_from_device = new Map<Sensor, number|number[]>();
      });

      this.deactivateLeftValve();
      this.deactivateRightValve();
      
      Object.entries(this.data).forEach((value) => {
        let sensor = parseInt(value[0]) as Sensor;
        this.notifySensorValue(sensor,sensor == Sensor.GPS?value[1] as number[]:  value[1] as number);
      });
                
      if(!onExecution){
        onExecution = true;

        // Loop que envía los registros por guardar en el servidor vía API/REST
        // Enviar siempre cada 100ms pero solo guardar cada 1s

        const iteration = async () =>{ 
          let currentWork : WorkExecution = await this.databaseService.getLastWorkExecution();

          if(currentWork){
            //Evaluar Tiempo Productivo e improductivo
            if(this.data[`${Sensor.WATER_FLOW}`] > 1){
              //Contar productivo
              instance.tiempoProductivo.start();
              instance.tiempoImproductivo.stop();
            }
            else{
              //Improductivo
              instance.tiempoImproductivo.start();
              instance.tiempoProductivo.stop();
            }

            currentWork.downtime = instance.tiempoImproductivo.time();
            currentWork.working_time = instance.tiempoProductivo.time();
            //console.log("TIEMPO IMPRODUCTIVO" , currentWork.downtime.format('H:mm:ss'));
            //console.log("TIEMPO PRODUCTIVO" , currentWork.working_time.format('H:mm:ss'));
            //Actualizar el tp e i en la db local
            await this.databaseService.updateTimeExecution(currentWork);
          }

          //Actualizar isRunning cada vez que se acabe el volumen de agua o se inicie el trabajo, o se finalice el trabajo.
          if(currentWork && this.isRunning){           
            let gps = this.data[`${Sensor.GPS}`];
   
            
            delete this.data[`${Sensor.GPS}`];
            delete this.data[`${Sensor.VALVE_LEFT}`]; //Eliminar valvula izquierda
            delete this.data[`${Sensor.VALVE_RIGHT}`]; //Eliminar valvula derecha 
            delete this.data[`${Sensor.PRESSURE_REGULATOR}`]; //Eliminar regulador de presion
            
            //Evaluar los eventos
            let has_events = false;
            let events = "";

            this.localConfig = await this.databaseService.getLocalConfig();
           
            if(this.data[`${Sensor.PRESSURE}`] < this.localConfig.min_pressure || this.data[`${Sensor.PRESSURE}`] > this.localConfig.max_pressure){
              has_events = true;
              events = "LA PRESION ESTA FUERA DEL RANGO ESTABLECIDO";
            }else if(this.data[`${Sensor.WATER_FLOW}`] < this.localConfig.min_wflow || this.data[`${Sensor.WATER_FLOW}`] > this.localConfig.max_wflow) {
              has_events = true;
              events = "EL CAUDAL ESTA FUERA DEL RANGO ESTABLECIDO";
            }

            let wExecutionDetail : WorkExecutionDetail =  {
              id_work_execution : currentWork.id, //Jalar el id del work execution
              time              : moment(),
              sended            : false,
              data              : JSON.stringify(this.data),
              gps               : JSON.stringify(gps),
              has_events        : has_events, //Evaluar eventos
              events            : events, //Evaluar los eventos
              id                : 0,
            }; 
            //Guardar en la db
            await this.databaseService.saveWorkExecutionDataDetail(wExecutionDetail);
          };
          onExecution = false;
        }

        let currentTime = moment();
        if(currentTime.diff(this.now,'seconds') >= 1){
          await iteration();
          this.now = currentTime;
        }
      }
    },200); 
  }

  findBySensor(sensor : number): ArduinoDevice{
    return this.listArduinos.find(p => p.sensors.some(x => x == sensor))!;
  }

  inicializarContenedor(inicial: number, minimo: number): void {
    this.initialVolume = inicial;
    this.currentRealVolume = inicial;
    this.minVolume = minimo;
    this.isRunning = true;
  }

  public  mapToObject(map: Map<any, any>): { [key: string]: any } {
    const obj: { [key: string]: any } = {};
    map.forEach((value, key) => {
      obj[key.toString()] = value;
    });
    return obj;
  }

    //Metodo para enviar el valor de presion que se le asignara
    public regulatePressureWithBars(bars: number): void {
      const regulatorId = Sensor.PRESSURE_REGULATOR;

      // Convertir el valor de bares según sea necesario, por ejemplo, asumamos que está en la misma unidad que se usó en el script original
      const barPressure = bars;

      //console.log('Enviando comando de regulación de presión...', barPressure);

      // Aquí deberías incluir la lógica para enviar el comando al dispositivo, por ejemplo:
      this.findBySensor(regulatorId).sendCommand(`${regulatorId}|${barPressure}`);
      //console.log("Comando" , `${regulatorId}|${barPressure}`);
    }

    //Metodo para resetear el volumen inicial y minimo
    public resetVolumenInit(): void {
      const command = 'B';
      this.findBySensor(Sensor.VOLUME).sendCommand(command);
    }

    //Metodo para resetear la pression inicial y minimo
    public resetPressure(): void {
      const command = 'B';
      this.findBySensor(Sensor.PRESSURE).sendCommand(command);
    }

    //
    public conteoPressure(): void {
      const command = 'E';
      this.findBySensor(Sensor.PRESSURE).sendCommand(command);
    }

    // Método para activar la válvula izquierda
    public activateLeftValve(): void {
      this.izquierdaActivada = true;
      const command = Sensor.VALVE_LEFT + '|1\n'; // Comando para activar la válvula izquierda
      this.findBySensor(Sensor.VALVE_LEFT).sendCommand(command);
    }

    // Método para desactivar la válvula izquierda
    public deactivateLeftValve(): void {
      this.izquierdaActivada = false;
      const command = Sensor.VALVE_LEFT  + '|0\n'; // Comando para desactivar la válvula izquierda
      this.findBySensor(Sensor.VALVE_LEFT).sendCommand(command);
      //console.log("Comando desactivar valvula izquierda", command);
    }

    // Método para activar la válvula derecha
    public activateRightValve(): void {
      this.derechaActivada = true;
      const command = Sensor.VALVE_RIGHT + '|1\n'; // Comando para activar la válvula derecha
      //console.log(command, "comand");
      this.findBySensor(Sensor.VALVE_RIGHT).sendCommand(command);
    }

    // Método para desactivar la válvula derecha
    public deactivateRightValve(): void {
      this.derechaActivada = false;
      const command = Sensor.VALVE_RIGHT + '|0\n'; // Comando para desactivar la válvula derecha
      this.findBySensor(Sensor.VALVE_RIGHT).sendCommand(command);
      //console.log("Comando desactivar valvula derecha", command);
    }

    //Regular la presion
    regulatePressure(): void {
      if (this.inputPressureValue !== undefined) {
        //console.log(this.inputPressureValue);
      this.regulatePressureWithBars(this.inputPressureValue);
      }
    }

    //Limpiar datos el arduino mediante el comando
    resetVolumen(): void {
      this.resetVolumenInit();
      this.minVolume = 0;
      this.currentRealVolume = 0;
      // this.maxVolume = 0;
    }

    /* Algoritmo para el tiempo productivo */
    /* IniciarApp(valorWatterflow : number): void {
      console.log("Ingreso a la funcion iniciarApp")
      if (this.isRunning && valorWatterflow > 0) {
        //console.log("Ingreso a la condicion si es true la varibale isRunning")
        this.resumeTimerProductive();
        this.pauseTimerImproductive();
        //console.log("valor del caudal", valorWatterflow);
      } else if(valorWatterflow <= 0){
        //console.log("Ingreso al else if si es false la variable y esta menos dee 0")
        //this.isRunning = false;
        this.resumeTimerImproductive();
        this.pauseTimerProductive();
      }
    } */


  //Este es el encargado de generar y emitir eventos de actualización
  private setupSensorSubjects(): void {
      // Crear Subject para cada tipo de sensor
    const sensorTypes: Sensor[] = Object.values(Sensor)
      .filter(value => typeof value === 'number') as Sensor[];

    sensorTypes.forEach((sensorType) => {
      this.sensorSubjectMap.set(sensorType, new Subject<number>());
    });
  }

  //Observa los eventos emitidos por el subject
  public getSensorObservable(sensorType: Sensor): Observable<number|number[]> {
      return this.sensorSubjectMap.get(sensorType)!.asObservable();
  }

  //Notifica si cambio el valor de los sensores
  public notifySensorValue(sensorType: Sensor, value: number|number[]): void {
    //console.log(`Nuevo valor para ${sensorType}: ${value}`)
    if (this.sensorSubjectMap.has(sensorType)) {
      this.sensorSubjectMap.get(sensorType)!.next(value);
      let volumenInicial = this.initialVolume;
      if (sensorType === Sensor.VOLUME) {
        if (this.currentRealVolume > this.minVolume && this.isRunning) {
          //this.currentRealVolume -= value as number;
          let valor = value as number;
          this.currentRealVolume = volumenInicial - valor;
          //console.log("Real Volume", this.currentRealVolume);
        }
      }
    }
  }

  //Notifica eventos del sensor de watterflow
 /*  public notifySensorWatterflow(sensor: Sensor, val: number) {
    if (sensor === Sensor.WATER_FLOW && val > 0) {
      // Calcula la reducción de volumen en función del caudal
      const volumeReduction = val * 60.0 / 1000.0; // Convierte el caudal de mL/s a litros/minuto

      // Actualiza el volumen actual
      this.currentVolume -= volumeReduction;

      if (this.currentVolume < this.minVolume) {
        // Realiza acciones adicionales cuando el volumen alcanza el mínimo
        console.log('Volumen mínimo alcanzado');
        // Puedes realizar otras acciones o detener el flujo según tus necesidades
      }

      // También puedes emitir eventos o notificar sobre cambios en el volumen
      this.notifyVolumeChange(this.currentVolume);
    }
  } */

 /*  private notifyVolumeChange(volume: number): void {
    // Emite un evento o realiza acciones cuando cambia el volumen
    console.log(`Volumen actual: ${volume} litros`);
  } */

}
