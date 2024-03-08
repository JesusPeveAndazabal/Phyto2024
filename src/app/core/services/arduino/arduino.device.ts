import { Injectable } from '@angular/core';
import { SerialPort} from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline'
import { ElectronService } from '../electron/electron.service';
import { Sensor } from '../../utils/global';

//Importacion del observable para el uso de las funciones reactivas para obtener los datos de los sensores
import { Observable, Subject } from 'rxjs';

export class ArduinoDevice {
  private isRunning: boolean = false;
  private manualSetting : boolean = true;
  sensors: number[] = [];
  mode: number = 0;
  private port: any;
  private message_to_device : string[] = [];
  public message_from_device: Map<Sensor, number|number[]> = new Map();
  private messageInterval: any;
  private SensorWatterflow: any;
  private SensorVolumen:any;
  private on_status_changed: any;

  /* data : reqlpro
  formato -

    json - string */

  private isReconnecting: boolean = false;

  //Creamos un sujeto (Subject) por cada sensor
  private sensorSubjectMap: Map<Sensor, Subject<number|number[]>> = new Map();

  private sensorWatterFlowSubject: Subject<Sensor> = new Subject<Sensor>();
  private sensorVolumeSubject: Subject<Sensor> = new Subject<Sensor>();

  //Este se comporta como el serial_device

  constructor(
    public path: string,public baudrate: number,public autoOpen: boolean,
    private electronService: ElectronService,
    // private arduinoService: ArduinoService,
  ) {
      this.connectToDevice(path, baudrate,autoOpen);
      /* this.setupSensorSubjects(); */
  }

  private connectToDevice(port: string, baudrate: number,autoOpen : boolean): void {
    try {
      this.port = new this.electronService.serialPort.SerialPort({ path: port , baudRate: baudrate,autoOpen : autoOpen});

      // Agrega el parser readline para facilitar la lectura de líneas
      // Método para manejar la reconexión en caso de desconexión
      const handleReconnect = () => {
        if (!this.isReconnecting) {
          this.isReconnecting = true;
          console.log('Arduino disconnected. Reconnecting...');

          // Intentar reconectar después de un breve período
          setTimeout(() => {
            this.connectToDevice(port, baudrate, autoOpen);
            this.isReconnecting = false;
            console.log('Connected to Arduino');
          }, 7000);
        }
      };

      // Manejar eventos de conexión y desconexión
      this.port.on('close', handleReconnect);
      this.port.on('error', handleReconnect);


      //variable para instanciar el this dentro de una funcion : clearInterval()
      let instance = this;

      //Metodo suplente del while
      this.messageInterval = setInterval(function(){
        //Obtener en la variable message los datos de bufffer mediante read()
        let message: Uint8Array | null = instance.port.read();
        if(message != null){
          //Conversion de los datos de la variable message y convertirlosm a formato utf-8
          const messagedecode: string = new TextDecoder('utf-8').decode(message);
          //console.log(messagedecode);
          //Se separa por la funcion split
          let messageBuffer = messagedecode.split('|');
          //console.log(messageBuffer);

          if(messageBuffer[0] == 'C'){
            instance.mode = parseInt(messageBuffer[1]);
            instance.sensors = messageBuffer[2].split(',').map((x: string) => parseInt(x, 10));
            instance.port.write(Buffer.from('OK\n', 'utf-8'));
            instance.isRunning = true;
            const parser = instance.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
            instance.listenToDevice(parser);
            clearInterval(instance.messageInterval);
          }
        }else if(instance.manualSetting){
          instance.isRunning = true;
        }
      },1000);
    } catch (error) {
      console.error('Error connecting to Arduino:', error);
    }
  }

  private listenToDevice(parser: any): void {
    parser.on('data', (data: string) => {
      //console.log(data);
      const values = data.trim().split('|');
      // Assuming values represent sensor readings
      //console.log(values);
      values.forEach((value : string, index : number) => {
        //Sensor id es igual a sensor type
        const sensorId = this.sensors[index];
        //El valor de cada sensor
        let numericValue : number | number[];
        if(sensorId == Sensor.GPS){
          numericValue = value.split(',').map(v => parseFloat(v));
        }
        else
          numericValue = parseFloat(value);

        //Sensor type = 2/5
        const sensorType = sensorId;

        //console.log("numericValue: " + numericValue);
        //console.log("sensorType: " + sensorType);

        if(this.sensorSubjectMap.has(sensorType)){
          this.sensorSubjectMap.get(sensorType)!.next(numericValue);
        }
        this.message_from_device.set(sensorType, numericValue);

        //this.arduinoService.notifySensorValue(sensorType, numericValue);
      });
      //console.log('Received message from Arduino:',this.mapToObject(this.message_from_device)) ;
    });
  }

  public sendCommand(command: string): void {
    if (this.port && this.port.writable) {
      this.port.write(`${command}\n`, 'utf-8', (error : any) => {
        if (error) {
          console.error('Error writing to Arduino:', error);
        } else {
          //console.log('Command sent to Arduino:', command);
        }
      });
    }
  }

  public disconnect(): void {
    if (this.port) {
      this.port.close((error : any) => {
        if (error) {
          console.error('Error closing connection:', error);
        } else {
          console.log('Disconnected from Arduino');
        }
      });
    }
  }
  public  mapToObject(map: Map<any, any>): { [key: string]: any } {
    const obj: { [key: string]: any } = {};
    map.forEach((value, key) => {
      obj[key.toString()] = value;
    });
    return obj;
  }
}
