import { AsignacionModel } from "./AsignacionModel";
import { CategoriaModel } from "./CategoriaModel";
import { HistorialEstadoModel } from "./HistorialEstadoModel";
import { UsuarioModel } from "./UsuarioModel";
import { ValoracionModel } from "./ValoracionModel";
export interface TicketsModel {
    id: number;
    id_ticket: number;    
    titulo: String;
    descripcion: String;
    fecha_creacion: Date | null;
    fecha_cierre: Date | null;
    estado: string;
    prioridad: string;
    cumplimiento_respuesta?: Boolean;
    cumplimiento_resolucion?: Boolean;

    id_categoria : number ;
    categoria?: CategoriaModel;

    id_usuario_cliente :number;
    cliente?:UsuarioModel;
    Historial_Estados?: HistorialEstadoModel[]
    asignaciones?: AsignacionModel[]

    valoracion?: ValoracionModel;
    aceptacion? : String; // campo realtivo para la aceptacion 
    
  }