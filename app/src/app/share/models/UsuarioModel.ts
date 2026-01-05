import { EspecialidadModel } from "./EspecialidadModel";
export interface UsuarioModel {
    id: number;
    id_usuario: number;
    correo: string;
    contrasena: string;
    nombre: string;
    activo :  Boolean;
    carga_actual : number;
    especialidades: EspecialidadModel[];
    id_rol: string;
    disponible?: Boolean;
  }