import { CategoriaModel } from "./CategoriaModel";
export interface EtiquetaModel {
    id: number;
    id_etiqueta : number;
    nombre  : string  
    categorias : CategoriaModel[]
  }