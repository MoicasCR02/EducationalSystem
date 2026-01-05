import { TicketsModel } from './TicketsModel';

export interface TicketsExtendido extends TicketsModel {
  tiempoRestante: number;
  campoCalculado: number;
  fecha_maxima_resolucion: Date;
}
