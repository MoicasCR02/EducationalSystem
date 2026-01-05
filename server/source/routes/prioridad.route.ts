import { Router } from "express";
import { prioridadController} from "../controllers/prioridadController";

export class PrioridadRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new prioridadController();

    router.get("/", controller.get);
    router.get("/:id", controller.getById);

    return router;
  }
}
