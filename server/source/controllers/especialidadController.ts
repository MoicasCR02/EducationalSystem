import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";
export class especialidadController {
  prisma = new PrismaClient();

  // Listado de Especialidades
get = async (request: Request, response: Response, next: NextFunction) => {
    const especialidades = await this.prisma.especialidad.findMany({
      orderBy: {
        id_especialidad: "asc",
      },
    });
    response.json(especialidades);
  };

  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let idEspecialidad = parseInt(request.params.id);
      if (isNaN(idEspecialidad)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objEspecialidad = await this.prisma.especialidad.findFirst({
        where: { id_especialidad: idEspecialidad },
      });
      if (objEspecialidad) {
        response.status(200).json(objEspecialidad);
      } else {
        next(AppError.notFound("No existe la etiqueta"));
      }
    } catch (error: any) {
      next(error);
    }
  };
}



