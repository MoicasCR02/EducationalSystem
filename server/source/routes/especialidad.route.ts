import { Router } from "express";
import { especialidadController} from "../controllers/especialidadController";

export class EspecialidadRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new especialidadController();

    router.get("/", controller.get);
    router.get("/:id", controller.getById);

    return router;
  }
}
