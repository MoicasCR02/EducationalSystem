import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { Asignacion, PrismaClient } from "../../generated/prisma";
export class etiquetaController {
  prisma = new PrismaClient();

  // Listado de Etiquetas
get = async (request: Request, response: Response, next: NextFunction) => {
    const etiquetas = await this.prisma.etiqueta.findMany({
      orderBy: {
        id_etiqueta: "asc",
      },
    });
    response.json(etiquetas);
  };

  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let idEtiqueta = parseInt(request.params.id);
      if (isNaN(idEtiqueta)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objEtiqueta = await this.prisma.etiqueta.findFirst({
        where: { id_etiqueta: idEtiqueta },
        include:{
          categorias: {
            include: {
              sla: true,
            }
          },
        }
      });
      if (objEtiqueta) {
        response.status(200).json(objEtiqueta);
      } else {
        next(AppError.notFound("No existe la etiqueta"));
      }
    } catch (error: any) {
      next(error);
    }
  };

  //Buscar etiqueta y encontrar categoria
    search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      //Obtener los valores del query string
      const { termino } = request.query;

      //const { categoria,etiquetas } =request.query;
      if (typeof termino !== "string" || termino.trim() === "") {
        next(AppError.badRequest("El término de búsqueda es requerido"));
      }
      const searchTerm: string = termino as string;
      const objVideojuego = await this.prisma.etiqueta.findMany({
        where: {
          nombre: {
            contains: searchTerm,
          },
        },
        include: {
          categorias: true,
        },
      });
      //Dar respuesta
      response.json(objVideojuego);
    } catch (error) {
      next(error);
    }
  };
}



