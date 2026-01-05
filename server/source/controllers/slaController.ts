import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";
export class slaController {
  prisma = new PrismaClient();

  // Listado de Etiquetas
get = async (request: Request, response: Response, next: NextFunction) => {
    const sla = await this.prisma.sla.findMany({
      orderBy: {
        id_sla: "asc",
      },
    });
    response.json(sla);
  };

  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let idSla = parseInt(request.params.id);
      if (isNaN(idSla)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objSla = await this.prisma.sla.findFirst({
        where: { id_sla: idSla },
      });
      if (objSla) {
        response.status(200).json(objSla);
      } else {
        next(AppError.notFound("No existe la etiqueta"));
      }
    } catch (error: any) {
      next(error);
    }
  };
}



