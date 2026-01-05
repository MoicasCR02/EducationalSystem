import { TicketsModel } from "./TicketsModel";
import { UsuarioModel } from "./UsuarioModel";

export interface AsignacionModel {
    id?: number;
    id_asignacion?: number       
    fecha_asignacion: Date  
    metodo:   string    
  
    id_ticket: number; // model
    id_tecnico: number; // model
    id_reglaAutotriage: number; // enlace con model 

    ticket?: TicketsModel
    tecnico?: UsuarioModel
    // regla : enlazar con model de reglas autortriage 
  }