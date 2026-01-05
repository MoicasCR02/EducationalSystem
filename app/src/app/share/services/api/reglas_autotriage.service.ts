import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { Reglas_AutotriageModel } from '../../models/ReglasAutotriageModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ReglasService extends BaseAPI<Reglas_AutotriageModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointreglas);
      }
}