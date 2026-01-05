import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "../../generated/prisma";

export class valoracionController {
  prisma = new PrismaClient();

  // Listado de valoracioes
  get = async (request: Request, response: Response, next: NextFunction) => {
    const valoraciones = await this.prisma.valoracion.findMany({
      orderBy: {
        comentario: "asc",
      },
    });
    response.json(valoraciones);
  };
  //Crear

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;

      const newValoracion = await this.prisma.valoracion.create({
        data: {
          puntuacion: body.puntuacion,
          comentario: body.comentario,
          fecha: body.fecha,
          id_ticket: body.id_ticket,
        },
      });
      response.status(201).json(newValoracion);
    } catch (error) {
      console.error("Error creando Categoria:", error);
      next(error);
    }
  };
}
