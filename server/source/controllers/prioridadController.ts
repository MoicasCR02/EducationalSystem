import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";
export class prioridadController {
  prisma = new PrismaClient();

  // Listado de Prioridades

get = async (request: Request, response: Response, next: NextFunction) => {
    const prioridades = await this.prisma.prioridad.findMany({
      orderBy: {
        id_prioridad: "asc",
      },
    });
    response.json(prioridades);
  };

  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let idPrioridad = parseInt(request.params.id);
      if (isNaN(idPrioridad)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objPrioridad = await this.prisma.prioridad.findFirst({
        where: { id_prioridad: idPrioridad },
      });
      if (objPrioridad) {
        response.status(200).json(objPrioridad);
      } else {
        next(AppError.notFound("No existe la prioridad"));
      }
    } catch (error: any) {
      next(error);
    }
  };
}



