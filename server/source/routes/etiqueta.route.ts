import { Router } from "express";
import { etiquetaController} from "../controllers/etiquetaController";

export class EtiquetaRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new etiquetaController();

    router.get("/", controller.get);
    router.get("/:id", controller.getById);

    return router;
  }
}
