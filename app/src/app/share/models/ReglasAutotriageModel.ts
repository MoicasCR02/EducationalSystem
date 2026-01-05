export interface Reglas_AutotriageModel {
  id: number;
  id_regla: number;
  nombre: string;
  descripcion: string;
  prioridad_base: number;
  peso_carga: number;
  peso_sla: number;
  activo: Boolean;
}
