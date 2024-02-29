import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { SyncRequestService,SyncRequestHeader } from 'ts-sync-request/dist'
import { Configuration } from "../../utils/configuration";
import { catchError, Observable, throwError } from "rxjs";
import { WorkExecution, WorkExecutionDetail } from "../../models/work-execution";
import { LocalConf } from "../../models/local_conf";


@Injectable({
  providedIn: "root"
})
export class ApiService {
  localConf : LocalConf;
  constructor(private http: HttpClient) {}

  // public getEmployee(code : string): Observable<Array<Trabajador>> {
  //   return this.http.get<Array<Trabajador>>(this.url,{params:{"code":code}});
  // }

/*   private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
 */
  /**
   * Obtiene la información de un empleado a partir de su código.
   *
   * @param {string} code - El código del empleado.
   * @returns {Array<Trabajador>}  Un arreglo de objetos Trabajador que contiene la información del empleado.
   */
/*   public getEmployee(code : string) : Array<Trabajador>{
    return new SyncRequestService().get<Array<Trabajador>>(`${Configuration.urlAsistencia}?code=${code}`);
  }
 */
  /**
   * Método para enviar un registro de peso al servidor.
   *
   * @param rPeso - Objeto que contiene el registro de peso a enviar.
   * @returns Una promesa que se resuelve con la respuesta del servidor.
   */
/*   public sendRegistro(rPeso: BaseRegistroPeso) {
    // Se genera el encabezado de autenticación con el token correspondiente
    let auth = new SyncRequestHeader("Authorization",  `Bearer ${Configuration.token}` );
    // Se realiza una petición POST al endpoint correspondiente para enviar el registro de peso
    return new SyncRequestService().post<BaseRegistroPeso, any>( `${Configuration.urlRest}registropeso/` , rPeso, [auth]);
  }
 */
  /**
 * Método para enviar un registro de peso de forma asíncrona.
 *
 * @param wExecution - Objeto BaseRegistroPeso que contiene la información del registro de peso.
 * @returns Observable<BaseRegistroPeso> - Observable que emite el objeto BaseRegistroPeso enviado.
 */
  public sendRegistroAsyncExecution(wExecution: WorkExecution): Observable<WorkExecution> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization:  `Bearer ${Configuration.token}`
      })
    };
    return this.http.post<WorkExecution>(`${Configuration.urlRest}/api/work-execution-app/` , wExecution, httpOptions);
  }

  public sendRegistroAsyncExecutionDetail(wExecutionDetail: WorkExecutionDetail[]): Observable<WorkExecutionDetail> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization:  `Bearer ${Configuration.token}`
      })
    };
    return this.http.post<WorkExecutionDetail>(`${Configuration.urlRest}/api/work-execution-data-app/` , wExecutionDetail, httpOptions);
  }

  //Metodo para actualizar en el server
  public sendUpdateExecution(wExecution: WorkExecution): Observable<WorkExecution>{
    let httpOptions = {
      headers : new HttpHeaders({
        'Conten-Type': 'application/json',
        Authorization: `Bearer ${Configuration.token}`
      })
    };
    return this.http.put<WorkExecution>(`${Configuration.urlRest}/api/work-execution-app/${wExecution.id_from_server}/`, wExecution, httpOptions)
  };
}
