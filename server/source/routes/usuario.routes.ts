import { Router } from "express";
import { usuarioController } from "../controllers/usuarioController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class UsuarioRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new usuarioController();

    router.post("/login", controller.login);
    router.post("/register", controller.register);
    router.get("/profile", authenticateJWT, controller.userAuth);

    router.get("/usuarios", controller.getUsuarios);
    router.get("/", controller.getByUser);
    router.get("/search", controller.search);
    router.get("/:id", controller.getById);
    router.get("/categoria/:idCategoria", controller.getByCategoria);
    router.post("/usuario/", controller.createUsuario);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.get("/correo/:correo", controller.getByCorreo);

    return router;
  }
}
