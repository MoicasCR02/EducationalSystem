import { ImagesModel } from "./ImagesModel";
import { TicketsModel } from "./TicketsModel";
import { UsuarioModel } from "./UsuarioModel";
export interface HistorialEstadoModel {
    id: number;
    id_historial: number;      
    estado_anterior :string; 
    nuevo_estado:    String ;
    observaciones:   String;
    fecha_cambio:   Date;

    id_ticket:  number;
    id_usuario: number;

    ticket?:  TicketsModel[];
    usuario?: UsuarioModel 

    Imagenes_Ticket? : ImagesModel[]
  }