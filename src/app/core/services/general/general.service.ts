import { Cultivation, Farm, Lot, NozzleColor, NozzleType, Nozzles, Person, Product, Weather, Work, WorkExecution } from './../../models/models';
import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import {  } from 'src/app/core/models/models';

@Injectable({
  providedIn: 'root'
})

export class GeneralService {

  constructor(private http: HttpClient) {
  }

  public getPeople(token : string): Observable<Array<Person>> {
    return this.http.get<Array<Person>>(`${environment.apiURL}/api/person-app/`);
  }

  public getCultivations(): Observable<Array<Cultivation>> {
    return this.http.get<Array<Cultivation>>(`${environment.apiURL}/api/cultivation-app/`);
  }

  public getFarm(): Observable<Array<Farm>> {
    return this.http.get<Array<Farm>>(`${environment.apiURL}/api/farm-app/`);
  }

  public getLots(): Observable<Array<Lot>> {
    return this.http.get<Array<Lot>>(`${environment.apiURL}/api/lot-app/`);
  }

  public getNozzleColors(): Observable<Array<NozzleColor>> {
    return this.http.get<Array<NozzleColor>>(`${environment.apiURL}/api/nozzle-color-app/`);
  }

  public getNozzleTypes(): Observable<Array<NozzleType>> {
    return this.http.get<Array<NozzleType>>(`${environment.apiURL}/api/nozzle-type-app/`);
  }

  public getNozzles(): Observable<Array<Nozzles>> {
    return this.http.get<Array<Nozzles>>(`${environment.apiURL}/api/nozzles-app/`);
  }

  public getProducts(): Observable<Array<Product>> {
    return this.http.get<Array<Product>>(`${environment.apiURL}/api/product-app/`);
  }

  public getWorks(): Observable<Array<Work>> {
    return this.http.get<Array<Work>>(`${environment.apiURL}/api/work-app/`);
  }

  /**
   * Obtiene los datos climatológicos de un lugar específico
   * @param location lugar referencial para el resultado del clima
   * @returns Weather object
   */
  public getCurrentWeather(location :string) : Observable<Weather>{
    return this.http.get<Weather>(`https://api.weatherapi.com/v1/current.json?q=${location}&lang=es&key=${environment.weatherAPIKey}`);
  }

}
