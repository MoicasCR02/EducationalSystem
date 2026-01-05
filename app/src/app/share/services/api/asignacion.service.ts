import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { AsignacionModel } from '../../models/AsignacionModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService extends BaseAPI<AsignacionModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointAsignaciones);
      }
}