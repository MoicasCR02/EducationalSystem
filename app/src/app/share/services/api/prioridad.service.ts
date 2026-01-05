import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { PrioridadModel } from '../../models/PrioridadModel';
import { environment } from '../../../../environments/environment.development';
@Injectable({
  providedIn: 'root'
})
export class PrioridadService extends BaseAPI<PrioridadModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointPrioridad)
      }
}