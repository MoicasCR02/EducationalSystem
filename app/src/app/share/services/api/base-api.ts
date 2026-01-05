import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { GetByCategoriaResponse } from '../../../tickets/tickets-asignacion/tickets-asignacion';
import { SLAResponse } from '../../models/SLAResponseModel';
export interface BaseEntity {
  id?: number;
}
@Injectable({
  providedIn: 'root',
})
export class BaseAPI<T extends BaseEntity> {
  /**
   * URL base del API, configurada en los archivos de entorno (environment.ts)
   * Ejemplo:
   *  environment.apiURL = 'http://localhost:3000'
   *
   * URL final de ejemplo si el endpoint = 'productos':
   *    http://localhost:3000/productos
   */
  urlAPI: string = environment.apiURL;

  constructor(
    private http: HttpClient,
    /**
     * Nombre del endpoint o recurso (por ejemplo: 'productos', 'usuarios', 'ordenes')
     * Se inyecta al crear una instancia concreta del servicio.
     */
    @Inject(String) private endpoint: string
  ) {}
  /**
   * Obtiene la lista completa de elementos del recurso
   * Ejemplo final: GET http://localhost:3000/productos
   */
  get(): Observable<T[]> {
    return this.http.get<T[]>(`${this.urlAPI}/${this.endpoint}`);
  }
  getTicketsPorMes(): Observable<T[]> {
    return this.http.get<T[]>(`${this.urlAPI}/${this.endpoint}/TicketsXMes`);
  }

  getTicketsResolucionRespuesta(): Observable<SLAResponse> {
    return this.http.get<SLAResponse>(`${this.urlAPI}/${this.endpoint}/TicketsResolucionRespuesta`);
  }

  getusuarios(): Observable<T[]> {
    return this.http.get<T[]>(`${this.urlAPI}/${this.endpoint}/usuarios`);
  }

  getByCorreo(correo: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.urlAPI}/${this.endpoint}/correo/${correo}`);
  }

  getByUser(id: number): Observable<T[]> {
    return this.http.get<T[]>(`${this.urlAPI}/${this.endpoint}/usuario/${id}`);
  }
  /**
   * Permite ejecutar un método GET personalizado, útil para endpoints con acciones específicas
   * Ejemplo:
   *  getMethod('activos') → GET http://localhost:3000/productos/activos
   */
  getMethod(action: string, options: { [param: string]: unknown } = {}): Observable<T | T[]> {
    return this.http.get<T[]>(`${this.urlAPI}/${this.endpoint}/${action}`, options);
  }
  /**
   * Obtiene un elemento por su ID
   * Ejemplo: GET http://localhost:3000/productos/5
   */
  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.urlAPI}/${this.endpoint}/${id}`);
  }
  /**
   * Crea un nuevo elemento
   * Ejemplo: POST http://localhost:3000/productos
   */
  create(item: T): Observable<T> {
    return this.http.post<T>(`${this.urlAPI}/${this.endpoint}`, item);
  }

  createUsuario(item: T): Observable<T> {
    return this.http.post<T>(`${this.urlAPI}/${this.endpoint}/usuario/`, item);
  }
  /**
   * Actualiza un elemento existente
   * Ejemplo: PUT http://localhost:3000/productos/5
   */
  update(item: T): Observable<T> {
    return this.http.put<T>(`${this.urlAPI}/${this.endpoint}/${item.id}`, item);
  }
  /**
   * Elimina un elemento existente
   * Ejemplo: DELETE http://localhost:3000/productos/5
   */
  delete(item: T) {
    return this.http.delete<T>(`${this.urlAPI}/${this.endpoint}/${item.id}`);
  }

  getByCategoria(id: number): Observable<T> {
    return this.http.get<T>(`${this.urlAPI}/${this.endpoint}/categoria/${id}`);
  }

  getByCategoriaP(id: number): Observable<GetByCategoriaResponse> {
    return this.http.get<GetByCategoriaResponse>(`${this.urlAPI}/${this.endpoint}/categoria/${id}`);
  }
}
