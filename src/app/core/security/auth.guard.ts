import { environment } from './../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { DatabaseService } from '../services/database/database.service';
// import { Message, MessageService } from 'primeng/api';
// import { CookieService } from 'ngx-cookie-service';
// import { Observable, map } from 'rxjs';
// import { Component } from '@angular/core';
// import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {

  constructor( protected databaseService: DatabaseService,
    protected _router: Router){
  }

  async canActivate() {
    const isValidResult = await this.isValid();
    // console.log(isValidResult, "el guardian pasa el main");
    return isValidResult;
  }

  private async isValid() {

    await this.databaseService.openConnection();

    let login = await this.databaseService.getLogin();
    let work_execution = await this.databaseService.getLastWorkExecution();
    // console.log(login, "login");
    // console.log(work_execution, "work_execution");
    if(work_execution || login){
      return true;
    }
    else{
      this._router.navigate(['/','login']);
      return false;
    }
  }
}
/**
 * Show the main page if exists an open work execution or if exists a session
 * saved in the cookies.
 * @param route
 * @param state
 * @returns
 */
export const authGuard : CanActivateFn =  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(PermissionsService).canActivate();
};

@Injectable({
  providedIn: 'root',
})

export class MainPermissionsService {

  constructor( protected databaseService: DatabaseService,
    protected _router: Router){
  }

  async canActivate() {
    const main = await this.isValid()
    // console.log(main, "canActivateMAIN");
    return main;
  }

  public mostrarAlerta(html){
    Swal.fire({
      width: 800,
      showCloseButton: true,
      showConfirmButton: false,
      html: "<h4>Control Phytosanitary</h4><br>" + html,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  }

  private async isValid() {

    await this.databaseService.openConnection();

/**
 * 1. Validacion de inicio de sesion (retornar a login)
 * 2. Validacion Configuracion de parametros de trabajos (boquillas, lote, ...)
 */

    // let cookie = this._cookie.get('session');
    let work_execution = await this.databaseService.getLastWorkExecution();

    if(work_execution){
      //Redirecto to settings page if not exists configuration parameters for current work execution.
      if(work_execution.configuration == ""){
        this._router.navigate(['/','main','settings']);
        this.mostrarAlerta("<p>Falta definir los parámetros de trabajo (2).</p>")
        return false;
      }

      return true;
    }
    else{
      this._router.navigate(['/','main','settings']);
      this.mostrarAlerta("<p>Primero debe definir los datos de la aplicación (1) y los parámetros de trabajo (2).</p>");
      return false;
    }
  }
}

/**
 * Show the main page if exists an open work execution or if exists a session
 * saved in the cookies.
 * @param route
 * @param state
 * @returns
 */
export const mainAuthGuard : CanActivateFn =  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(MainPermissionsService).canActivate();
};


@Injectable({
  providedIn: 'root',
})
export class ConfigService {

  constructor(protected databaseService: DatabaseService,
    protected _router: Router){
  }

  async canActivate() {
    const isValidResult = await this.isValid();
    // console.log(isValidResult, "EL GUARDIA PASA EL LOGIN");
    return isValidResult;
  }

  private async isValid() {

    await this.databaseService.openConnection();

    let config = await this.databaseService.getLocalConfig();
    // console.log(config, "auth.guard");
    if(!config){
      //Redirecto to config page if not exists configuration parameters.
      this._router.navigate(['/','config']);
      return false;
    }
    environment.apiURL = config.api_server;
    // environment.wsURL = config.ws_server;
    environment.minVolume = config.vol_alert_on;
    return true;
  }
}
/**
 * Show the config page if not exixts config data
 * @param route
 * @param state
 * @returns
 */
export const configAuthGuard : CanActivateFn =  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(ConfigService).canActivate();
};

