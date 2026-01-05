import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";
export class reglasAutotrigeController{
  prisma = new PrismaClient();

  // Listado de Reglas
  get = async (request: Request, response: Response, next: NextFunction) => {
    const Reglas = await this.prisma.reglas_Autotriage.findMany({
      orderBy: {
        prioridad_base: "desc",
      },
    });
    response.json(Reglas);
  };

  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let id_regla = parseInt(request.params.id);
      if (isNaN(id_regla)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objRegla = await this.prisma.reglas_Autotriage.findFirst({
        where: { id_regla: id_regla },
      });
      if (objRegla) {
        response.status(200).json(objRegla);
      } else {
        next(AppError.notFound("No existe la regla"));
      }
    } catch (error: any) {
      next(error);
    }
  };
  //Modificar luego
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      //Obtener los valores del query string
      const { termino } = request.query;

      //const { categoria,etiquetas } =request.query;
      if (typeof termino !== "string" || termino.trim() === "") {
        next(AppError.badRequest("El término de búsqueda es requerido"));
      }
      const searchTerm: string = termino as string;
      const objVideojuego = await this.prisma.usuario.findMany({
        where: {
          nombre: {
            contains: searchTerm,
          },
        },
        include: {
          especialidades: true,
        },
      });
      //Dar respuesta
      response.json(objVideojuego);
    } catch (error) {
      next(error);
    }
  };

  //Crear

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;

      const newCategoria = await this.prisma.categoria.create({
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion,
          etiquetas: {
            connect: body.etiquetas,
          },
          sla: {
            connect: body.sla,
          },
          especialidades: {
            connect: body.especialidades,
          },
        },
      });
      response.status(201).json(newCategoria);
    } catch (error) {
      console.error("Error creando Categoria:", error);
      next(error);
    }
  };
  //Actualizar una categoria
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const idCategoria = parseInt(request.params.id);

      //Obtener categoria anterior
      const CategoriaExistente = await this.prisma.categoria.findUnique({
        where: { id_categoria: idCategoria },
        include: {
          etiquetas: {
            select: {
              id_etiqueta: true,
            },
          },
          sla: true,
          especialidades: {
            select: {
              id_especialidad: true,
            },
          },
        },
      });
      if (!CategoriaExistente) {
        response
          .status(404)
          .json({ message: "La categoria no existe no existe" });
        return;
      }

      // Desconectar etiquetas antiguas y conectar las nuevas
      const disconnectEtiquetas = CategoriaExistente.etiquetas.map(
        (etiqueta: { id_etiqueta: number }) => ({
          id_etiqueta: etiqueta.id_etiqueta,
        })
      );

      const connectEtiquetas = body.etiquetas
        ? body.etiquetas.map((etiqueta: { id_etiqueta: number }) => ({
            id_etiqueta: etiqueta.id_etiqueta,
          }))
        : [];
      // Desconectar etiquetas antiguas y conectar las nuevas
      const disconnectEspecialidades = CategoriaExistente.especialidades.map(
        (especialidades: { id_especialidad: number }) => ({
          id_especialidad: especialidades.id_especialidad,
        })
      );

      const connectEspecialidades = body.especialidades
        ? body.especialidades.map(
            (especialidades: { id_especialidad: number }) => ({
              id_especialidad: especialidades.id_especialidad,
            })
          )
        : [];

      //Actualizar
      const updateCategoria = await this.prisma.categoria.update({
        where: {
          id_categoria: idCategoria,
        },
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion,
          etiquetas: {
            disconnect: disconnectEtiquetas,
            connect: connectEtiquetas,
          },
          sla: {
            connect: { id_sla: body.sla.id_sla }, 
          },
          especialidades: {
            disconnect: disconnectEspecialidades,
            connect: connectEspecialidades,
          },
        },
      });

      response.json(updateCategoria);
    } catch (error) {
      next(error);
    }
  };
}
