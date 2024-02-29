import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Configuration } from '../utils/configuration';

@Injectable()
export class AtomizerAuthInterceptor implements HttpInterceptor {
    constructor(){

    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // console.log('Interceptor is called');
        // const token =`${Configuration.token}`;
        const token =`${environment.token}`;
        // console.log('Token:', token);
        if (token) {
            request = request.clone({
                setHeaders: {
                  'Content-Type':  'application/json',
                  Authorization: `Token ${token}`
                }
            });
            //console.log('Request:', request);
        }
        return next.handle(request);
    }
  //   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //     const token = this._cookie.get("server_token");
  //     if (token) {
  //         request = request.clone({
  //             setHeaders: {
  //             Authorization: `Token ${token}`
  //             }
  //         });
  //     }
  //     return next.handle(request);
  // }
}
