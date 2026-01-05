import { TicketsModel } from "./TicketsModel";
export interface ValoracionModel {
    id: number;
    id_valoracion: number;
    puntuacion: number;
    comentario: String;
    fecha: Date;

    id_ticket: number;
    ticket?: TicketsModel;
  }