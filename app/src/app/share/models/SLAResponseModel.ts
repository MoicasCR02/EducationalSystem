export interface TicketDetalle {
  id_ticket: number;
  titulo: string;
  cumplimiento_respuesta: boolean;
  cumplimiento_resolucion: boolean;
}

export interface SLAIndicador {
  cumplimiento: string;     // porcentaje en string, ej. "20.00"
  incumplimiento: string;   // porcentaje en string, ej. "80.00"
}

export interface SLAResponse {
  slaRespuesta: SLAIndicador;
  slaResolucion: SLAIndicador;
  detalle: TicketDetalle[];
}