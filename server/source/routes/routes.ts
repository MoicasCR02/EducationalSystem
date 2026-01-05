import { Router } from "express";
import { UsuarioRoutes } from "./usuario.routes";
import { CategoriaRoutes } from "./categoria.route";
import { TicketRoutes } from "./ticket.route";
import { AsignacionRoutes } from "./asignacion.route";
import { EtiquetaRoutes } from "./etiqueta.route";
import { SlaRoutes } from "./sla.route";
import { EspecialidadRoutes } from "./especialidad.route";
import { PrioridadRoutes } from "./prioridad.route";
import { ReglasRoutes } from "./reglas.route";
import { ValoracionRoutes } from "./valoracion.route";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    // ----Agregar las rutas----
    router.use("/usuarios", UsuarioRoutes.routes);
    router.use("/categorias", CategoriaRoutes.routes);
    router.use("/tickets", TicketRoutes.routes);
    router.use("/asignaciones", AsignacionRoutes.routes);
    router.use("/etiquetas", EtiquetaRoutes.routes);
    router.use("/sla", SlaRoutes.routes);
    router.use("/especialidades", EspecialidadRoutes.routes);
    router.use("/prioridades", PrioridadRoutes.routes);
    router.use("/reglasAutotriage", ReglasRoutes.routes);
    router.use("/valoraciones", ValoracionRoutes.routes);
    
    return router;
  }
}
