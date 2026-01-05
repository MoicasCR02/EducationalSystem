import { Router } from "express";
import { asignacionController } from "../controllers/asigancionController";

export class AsignacionRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new asignacionController();

    router.get("/", controller.get);
    router.get("/usuario/:id", controller.getByUser);
    router.get("/search", controller.search);
    router.get("/:id", controller.getById);
    router.post("/", controller.create);

    return router;
  }
}
