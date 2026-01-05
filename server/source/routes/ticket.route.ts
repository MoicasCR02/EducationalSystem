import { Router } from "express";
import { TicketController} from "../controllers/ticketController";

export class TicketRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TicketController();

    router.get("/usuario/:id", controller.get);
    router.get("/TicketsXMes", controller.getTicketsPorMes);
    router.get("/TicketsResolucionRespuesta", controller.getTicketsResolucionRespuesta);
    router.get("/search", controller.search);
    router.get("/:id", controller.getById);
    router.post("/", controller.create);
    router.put("/:id", controller.update);

    return router;
  }
}
