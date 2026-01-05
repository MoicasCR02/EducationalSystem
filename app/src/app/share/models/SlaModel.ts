import { CategoriaModel } from "./CategoriaModel";

export interface SlaModel {
    id: number;
    id_sla : number;
    nombre: String;
    tiempo_max_respuesta : number;
    tiempo_max_resolucion: number;
    categorias: CategoriaModel[]
  }