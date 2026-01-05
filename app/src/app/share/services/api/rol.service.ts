import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { RoleModel } from '../../models/RoleModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RolService extends BaseAPI<RoleModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointRol);
      }
}