import { Router } from "express";
import { reglasAutotrigeController } from "../controllers/reglasAutotrigeController";

export class ReglasRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new reglasAutotrigeController();

    router.get("/", controller.get);
    router.get("/:id", controller.getById);
    return router;
  }
}
