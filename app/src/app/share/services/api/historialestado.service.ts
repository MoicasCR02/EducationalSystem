import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { HistorialEstadoModel } from '../../models/HistorialEstadoModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class HistorialEstadoService extends BaseAPI<HistorialEstadoModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointUsuarios);
      }
}