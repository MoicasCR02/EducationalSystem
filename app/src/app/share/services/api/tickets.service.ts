import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { TicketsModel } from '../../models/TicketsModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TicketsService extends BaseAPI<TicketsModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointTickets);
      }
      
}