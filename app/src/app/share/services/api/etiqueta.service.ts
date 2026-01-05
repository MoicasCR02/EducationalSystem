import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { EtiquetaModel } from '../../models/EtiquetasModel';
import { environment } from '../../../../environments/environment.development';
@Injectable({
  providedIn: 'root'
})
export class EtiquetaService extends BaseAPI<EtiquetaModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointEtiquetas);
      }
}