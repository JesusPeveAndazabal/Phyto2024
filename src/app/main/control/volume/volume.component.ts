import { interval, startWith, switchMap } from 'rxjs';
import { ArduinoService } from '../../../core/services/arduino/arduino.service';
import { WorkExecution } from './../../../core/models/work-execution';
import { Sensor, config } from './../../../core/utils/global';
import { ChangeDetectorRef, Component, EventEmitter, Injectable, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { DatabaseService } from '../../../core/services';
import { LocalConf } from '../../../core/models/local_conf';
// import { WebSocketClientService } from 'src/app/core/services/services';
// import { Sensor, SocketEvent,config } from 'src/app/core/utils/global';
@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.scss'],
})
export class VolumeComponent  implements OnInit,OnChanges {
  @Input("wExecution") wExecution! : WorkExecution;
  @Input("leftControlActive") leftControlActive : boolean = false;
  @Input("rightControlActive") rightControlActive : boolean = false;
  @Input("maxCurrentVolume") maxVolume : number = 0;
  @Input("currentVolume") volume : number = 0;
  @Input("currentPh") currentPh : number = 0;
  @Input("latitudGPS") latitudGPS : number = 0;
  @Input("longitudGPS") longitudGPS : number = 0;
    // Output
  // @Output() leftControlActiveChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Output() rightControlActiveChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output("onLeftChange") onLeftChange = new EventEmitter<boolean>();
  @Output("onRightChange") onRightChange = new EventEmitter<boolean>();
  // @Output("leftControlActiveOP") leftControlActiveOP = new EventEmitter<boolean>();
  // @Output("rightControlActiveOP") rightControlActiveOP = new EventEmitter<boolean>();

  public derechaActiva: boolean = false;
  public izquierdaActiva: boolean = false;
  public bothControlsActive: boolean = false;
  private container! : Wave;
  public shouldBlink: boolean = false;
  localConfig! : LocalConf;
  minVolume: number = 0;
  // currentVolume = 20;
  percentVolume = 0;
  derecha: boolean = false;
  izquierda: boolean = false;
  constructor(public arduinoService :ArduinoService, private dbService: DatabaseService,private changeDetectorRef: ChangeDetectorRef) {

   }

  ngOnChanges(changes: SimpleChanges) {
    if(this.wExecution){

      this.setVolume(this.volume);

    }
    // this.shouldBlink= true;
  }

  async ngOnInit() {
    //this.setVolume(40);
    // this.animateWaves();
    // this.shouldBlink= true;
    this.localConfig = await this.dbService.getLocalConfig();    
    this.minVolume = this.localConfig.vol_alert_on;
    const intervalObservable = interval(1000); // Puedes ajustar el intervalo según sea necesario

    // Combina el observable del intervalo con tu observable de sensor
    intervalObservable.pipe(
      startWith(0), // Emite un valor inicial para que comience inmediatamente
      switchMap(() => this.arduinoService.getSensorObservable(Sensor.VOLUME))
    ).subscribe((valorDelSensor:number) => {
      this.volume = parseFloat(this.arduinoService.currentRealVolume.toFixed(2));


      if (this.arduinoService.currentRealVolume < this.minVolume && this.arduinoService.isRunning) {
        //this.shouldBlink = true;
        this.apagarValvulas();
        this.arduinoService.isRunning = false;
      } else {
        this.shouldBlink = false;
      }
    });
    
    this.container = new Wave({
      unit: 10, // wave size
      info: {
        infoSeconds: 0,
        infoTime: 0,
      },
      animationFrame: .014,
      timeoutSecond: 35,
      el: '#animation-frame',
      colorList: ['#0ff'] ,
      opacity: [0.8] ,
      zoom: [3],
      startPosition: [0],
      lineWidth: 1 ,
      xAxis: 10,
      yAxis: 0,
      stroke: true,
      fill: true,
      // canvasWidth: 400,
      // canvasHeight: 300,
    });
  }

  get maxCurrentVolume(): number {
    return config.maxVolume;
  }

  get currentPercentVolume(): number {
    this.percentVolume = parseFloat((100 * this.volume / config.maxVolume).toFixed(2));
    // console.log(this.percentVolume, "percent volume 1");
    this.percentVolume = isNaN(this.percentVolume) ? 0 : this.percentVolume;
    return this.percentVolume;
  }

  setVolume(volume: number){
    this.volume = parseFloat(volume.toFixed(2));
    this.percentVolume = isNaN(this.percentVolume) ? 0 : this.percentVolume;
    this.container.xAxis = this.map(this.percentVolume,0,100,this.container.canvas.height,0);
  }

  // toggleValvulaDerecha($event : any):void{
  //   this.arduinoService.toggleValvulaDerecha();
  // }
  toggleValvulaDerecha():void{
    this.rightControlActive = !this.rightControlActive;
    // this.derecha = this.rightControlActive;
    console.log("Estado derecha" , this.rightControlActive);
    if(this.rightControlActive){
      this.arduinoService.activateRightValve();
    }else{
      this.arduinoService.deactivateRightValve();
    }
  }

  apagarValvulas():void{
    this.leftControlActive = false;
    this.rightControlActive = false;
    console.log("ESTADO IZQUIERDA", this.rightControlActive);
    console.log("ESTADO DERECHA", this.leftControlActive);
    this.arduinoService.deactivateLeftValve();
    this.arduinoService.deactivateRightValve();
    //this.changeDetectorRef.detectChanges();
  }

  toggleValvulaIzquierda():void{
    this.leftControlActive = !this.leftControlActive;
    // this.izquierda = this.leftControlActive;
    console.log("Estado Izquierda" , this.leftControlActive);
    if(this.leftControlActive){
      this.arduinoService.activateLeftValve();
    }else{
      this.arduinoService.deactivateLeftValve();
    }
  }

  toggleAmbasValvulas() {
    // Alternar el estado de ambas válvulas
    this.bothControlsActive = !this.bothControlsActive;
  
    // Activa o desactiva las dos válvulas según el estado de ambos controles
    if (this.bothControlsActive) {
      this.leftControlActive = true;
      this.rightControlActive = true;
      this.arduinoService.activateLeftValve();
      this.arduinoService.activateRightValve();
    } else {
      this.leftControlActive = false;
      this.rightControlActive = false;
      this.arduinoService.deactivateLeftValve();
      this.arduinoService.deactivateRightValve();
    }
  }
  

  map(value : number, fromLow : number, fromHigh : number, toLow : number, toHigh : number) {
    return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
  }
}


class Wave {
  unit: any;
  info: any;
  animationFrame: any;
  timeoutSecond: any;
  canvas: any;
  colorList: any;
  opacity: any;
  zoom: any;
  startPosition: any;
  lineWidth: any;
  xAxis: any;
  yAxis: any;
  stroke: any;
  fill: any;
  constructor(private config : any) {
    this.unit = config.unit || 100 //tamaño de onda
    this.info = config.info || {}; // Información de dibujo común al lienzo
    this.info.seconds = config.infoSeconds || 0;
    this.info.time = config.infoTime || 0; //Velocidad de flujo
    this.animationFrame = config.animationFrame || .014; //número de segundos en un cuadro de animación
    this.timeoutSecond = config.timeoutSecond || 35 // velocidad de dibujo
    this.canvas = document.querySelector(config.el) || document.createElement('canvas'); //Selección del elemento canvas
    this.colorList = config.colorList || ['#0ff', '#ff0', '#f00', '#00f', '#f0f'] ; // Información de color para cada lienzo.
    this.opacity = config.opacity || [0.8, 0.5, 0.3, 0.2, 0.8] ; //a través de
    this.zoom = config.zoom || [3, 4, 1.6, 3, 2]; //Ancho de onda Longitud de longitud de onda
    this.startPosition = config.startPosition || [0, 0, 0, 100, 0]; //retraso en la posición inicial de la onda
    this.lineWidth = config.lineWidth || 1 ; //ancho de línea
    this.xAxis = config.xAxis || Math.floor (this.canvas.height / 2); //eje x
    this.yAxis = config.yAxis || -1; //eje Y
    this.stroke = config.stroke || true; //Solo línea ondulada
    this.fill = config.fill || false; //llenar

    // this.canvas.width = config.canvasWidth || document.documentElement.clientWidth; // Ajustar el ancho del lienzo al ancho de la ventana
    // this.canvas.height = config.canvasHeight || 200; //altura de la ola desde abajo
    this.canvas.contextCache = this.canvas.getContext("2d");

    if (this.canvas.parentNode === null) {
      const body = document.querySelector('body')!;
      body.appendChild(this.canvas);
    }
    this.update();
    //this.setPH(0);
  }

  update() {

    this.draw (this.canvas, this.colorList);

    // Actualización de información de dibujo común
    this.info.seconds = this.info.seconds + this.animationFrame;
    this.info.time = this.info.seconds * Math.PI;
    // auto recursión
    setTimeout(this.update.bind(this), this.timeoutSecond); //¡Esto de Establecer tiempo de espera se convierte en ventana!
  }

  draw(canvas : any, color : any) {
    //console.log(canvas.width, canvas.height);
    // Obtenga el contexto del objetivo this.canvas
    var context = canvas.contextCache;
    // dibujo de lienzo claro
    context.clearRect(0, 0, canvas.width, canvas.height);
    //Dibuje una ola dibujarWave this.canvas, color[número (especifique el número de ondas desde 0)], transparencia, zoom de ancho de onda, retardo de posición de inicio de onda)
    for (let i = 0; i < this.colorList.length; i++){
      this.drawWave (canvas, color[i], this.opacity[i], this.zoom[i], this.startPosition[i]);
    }
  }

  drawWave (canvas: any, color : any, alpha : any, zoom: any, delay: any) {
    var context = canvas.contextCache;
    context.globalAlpha = alpha;
    context.beginPath(); //inicio de camino
    this.drawSine (canvas, this.info.time / 0.5, zoom, delay);

    if(this.stroke){
      context.strokeStyle = color; //color de linea
      context.lineWidth = this.lineWidth; //ancho de línea
      context.stroke(); //Cable
    }
    if(this.fill){
      context.lineTo(canvas.width + 10, canvas.height); //camino a la parte inferior derecha del lienzo
      context.lineTo(0, canvas.height); //camino a la parte inferior izquierda del lienzo
      context.closePath() //cerrar el camino
      context.fillStyle = color;//color de relleno
      context.fill(); //llenar
    }
  }

  drawSine (canvas: any, t:any, zoom:any, delay:any) {
    var xAxis = this.xAxis;
    var yAxis = this.yAxis;
    var context = canvas.contextCache;
    // Set the initial x and y, starting at 0,0 and translating to the origin on
    // the canvas.
    var x = t; //ajuste el tiempo a la posición horizontal
    var y = Math.sin(x) / zoom;
    context.moveTo(yAxis, this.unit * y + xAxis); //colocar el pase en la posición inicial

    // Loop to draw segments (Dibuja una onda para el ancho.)
    for (let i = yAxis; i <= canvas.width + 10; i += 10) {
      x = t + (-yAxis + i) / this.unit / zoom;
      y = Math.sin(x - delay) / 3;
      context.lineTo(i, this.unit * y + xAxis);
    }
  }


}
