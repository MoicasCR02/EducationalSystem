import { Router } from "express";
import { slaController} from "../controllers/slaController";

export class SlaRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new slaController();

    router.get("/", controller.get);
    router.get("/:id", controller.getById);

    return router;
  }
}
