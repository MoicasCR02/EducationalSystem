import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { environment } from '../../../../environments/environment.development';
import { ValoracionModel } from '../../models/ValoracionModel';

@Injectable({
  providedIn: 'root'
})
export class ValoracionService extends BaseAPI<ValoracionModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointValoracion);
      }
}