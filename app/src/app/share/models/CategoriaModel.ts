import { EspecialidadModel } from "./EspecialidadModel";
import { EtiquetaModel } from "./EtiquetasModel";
import { SlaModel } from "./SlaModel";

export interface CategoriaModel {
    id: number;
    id_categoria :   number;     
    nombre      :    string;
    descripcion  :   string;
    especialidades : EspecialidadModel[];
    etiquetas: EtiquetaModel[];
    sla : SlaModel;

  //tickets: Ticket[] // hacer con la relacion dle ticke model

  }