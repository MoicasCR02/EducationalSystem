import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { Asignacion, PrismaClient, Role } from "../../generated/prisma";
export class asignacionController {
  prisma = new PrismaClient();

  // Listado de Asignaciones
  get = async (request: Request, response: Response, next: NextFunction) => {
    const asiganciones = await this.prisma.asignacion.findMany({
      orderBy: {
        id_asignacion: "asc",
      },
      include: {
        tecnico: true,
        ticket: {
          include: {
            categoria: {
              include: {
                sla: true,
              },
            },
          },
        },
      },
    });
    response.json(asiganciones);
  };

  getByUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const idusuario = parseInt(request.params.id);

      const usuario = await this.prisma.usuario.findUnique({
        where: { id_usuario: idusuario },
      });

      let whereClause: any = {};

      if (usuario?.id_rol === "TECNICO") {
        // Trae solo asignaciones del técnico
        whereClause = { id_tecnico: idusuario };
      } else if (usuario?.id_rol === "ADMIN") {
        // Trae todas las asignaciones
        whereClause = {};
      } else if (usuario?.id_rol === "USER") {
        // No trae nada → devolvemos arreglo vacío
        return response.json([]);
      }

      const asignaciones = await this.prisma.asignacion.findMany({
        where: whereClause,
        orderBy: { id_asignacion: "asc" },
        include: {
          tecnico: true,
          ticket: {
            include: {
              categoria: {
                include: { sla: true },
              },
            },
          },
        },
      });

      response.json(asignaciones);
    } catch (error) {
      next(error);
    }
  };

  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let idUsuario = parseInt(request.params.id);
      if (isNaN(idUsuario)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objUsuario = await this.prisma.usuario.findFirst({
        where: { id_usuario: idUsuario },
        include: {
          especialidades: true,
        },
      });
      if (objUsuario) {
        response.status(200).json(objUsuario);
      } else {
        next(AppError.notFound("No existe el Uusario"));
      }
    } catch (error: any) {
      next(error);
    }
  };
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

create = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const body = request.body;

    const tecnico = await this.prisma.usuario.findFirst({
      where: { id_usuario: body.id_tecnico },
    });

    const ticket = await this.prisma.ticket.findFirst({
      where: { id_ticket: body.id_ticket },
    });

    if (tecnico && ticket) {
      const newAsignacion = await this.prisma.asignacion.create({
        data: {
          fecha_asignacion: body.fecha_asignacion,
          metodo: body.metodo,
          id_ticket: ticket.id_ticket,
          id_tecnico: tecnico.id_usuario,
          id_reglaAutotriage: body.id_reglaAutotriage,
        },
      });

      let updateTecnico = null;
      let updateTicket = null;

      if (newAsignacion.metodo === "Automático") {
        updateTecnico = await this.prisma.usuario.update({
          where: { id_usuario: tecnico.id_usuario },
          data: {
            carga_actual: { increment: 1 },
          },
        });
        updateTicket = await this.prisma.ticket.update({
          where: { id_ticket: ticket.id_ticket },
          data: {
            estado: "Asignado",
            Historial_Estados: {
              create: [
                {
                  estado_anterior: "Pendiente",
                  nuevo_estado: "Asignado",
                  observaciones:
                    "Asignación automática por reglas de autotriage",
                  fecha_cambio: new Date(),
                  id_usuario: 1, 
                  Imagenes_Ticket: {
                    create: [
                      {
                        ruta_imagen: "Asignado.jpg", 
                      },
                    ],
                  },
                },
              ],
            },
          },
        });
      }
      response.status(201).json({
        asignacion: newAsignacion,
        tecnico: updateTecnico,
        ticket: updateTicket,
      });
    } else {
      response.status(404).json({ mensaje: "Técnico o ticket no encontrado" });
    }
  } catch (error) {
    console.error("Error creando Asignación:", error);
    next(error);
  }
};

}
