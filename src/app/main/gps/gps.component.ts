// import { WebSocketClientService } from './../../core/services/websocket-client/web-socket-client.service';
// import { SocketEvent } from './../../core/utils/global';
import { Component, OnInit,AfterViewInit,OnChanges } from '@angular/core';
import { Location } from '@angular/common';
import { Loader } from '@googlemaps/js-api-loader';
import { config } from './../../core/utils/global'; //// Actualizar la propiedad gps hacer push de la nueva coordenada
// import { WebSocketClientService } from './../../core/services/services';
// import { SocketData, WorkExecutionData } from './../../core/models/models';
// import Swal from 'sweetalert2';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss'],
})

export class GpsComponent  implements OnInit,AfterViewInit,OnChanges {
  private loader: Loader;
  private map!: google.maps.Map;
  private wasCentered: boolean = false;
  constructor(private location: Location, public alerta:SettingsComponent) {
    this.loader = new Loader({
      apiKey: 'AIzaSyB1e3MksyyGNyEfpLsAAW_a_dWddLWY2V0',
      version: 'weekly', // La versión de la API de Google Maps que deseas utilizar
    });
  }

  ngOnInit() {

    if (!navigator.onLine)
      return;

    this.loader.importLibrary('maps').then(() => {
      // Crea un nuevo objeto Map y lo asocia con el elemento HTML
      this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: { lat: -14.2269637, lng: -75.7039387 },
        zoom: 17.5,
        mapTypeId: "satellite",
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        gestureHandling: 'greedy'
      });

      this.loadMarkers();
    });
  }

  ngOnChanges(changes: any) {
    this.loadMarkers();
  }

  loadMarkers() {
    //verufuca si hay una configuracion definida, si existe config.gps , si es un array y si tiene mas de un elemento
    if (config && config.gps && Array.isArray(config.gps) && config.gps.length > 1) {
        if (!this.wasCentered && this.map) {
            this.map.setCenter({ lat: config.gps[0][0], lng: config.gps[0][1] });
            this.wasCentered = true;
        }

        let pathLines = [];

        for (let i = 0; i < config.gps.length; i++) {
            pathLines.push({ lat: config.gps[i][0], lng: config.gps[i][1] });
        }

        let line = new google.maps.Polyline({
            path: pathLines,
            geodesic: true,
            strokeColor: '#4986E7',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });

        line.setMap(this.map);
    }
  }


  ngAfterViewInit(){
    if (!navigator.onLine){
      this.alerta.mostrarAlertaChica("<p>¡No hay conexión a internet!</p>")
      this.location.back();
    }
  }

}
