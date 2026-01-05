import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import {
  Ticket,
  PrismaClient,
  Historial_Estado,
  Role,
} from "../../generated/prisma";
export class TicketController {
  prisma = new PrismaClient();

  // Listado de Tickets
  get = async (request: Request, response: Response, next: NextFunction) => {
    let idusuario = parseInt(request.params.id);
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id_usuario: idusuario,
      },
    });

    let whereClause = {};

    if (usuario?.id_rol === "USER") {
      whereClause = {
        id_usuario_cliente: idusuario,
      };
    } else if (usuario?.id_rol === "TECNICO") {
      whereClause = {
        asignaciones: {
          some: {
            id_tecnico: idusuario,
          },
        },
      };
    }
    // ADMIN no necesita filtro

    // 📦 Consulta a la base de datos con Prisma
    const tickets = await this.prisma.ticket.findMany({
      where: whereClause,
      orderBy: {
        id_ticket: "asc",
      },
      include: {
        categoria: {
          include: {
            sla: true,
            especialidades: true,
          },
        },
        cliente: true,
        Historial_Estados: {
          include: {
            Imagenes_Ticket: true,
          },
        },
        valoracion: true,
        asignaciones: true,
      },
    });

    // 📤 Enviar respuesta
    response.json(tickets);
  };

  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let idTicket = parseInt(request.params.id);
      if (isNaN(idTicket)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objTicket = await this.prisma.ticket.findFirst({
        where: { id_ticket: idTicket },
        include: {
          categoria: {
            include: {
              sla: true,
            },
          },
          cliente: true,
          Historial_Estados: {
            include: {
              Imagenes_Ticket: true,
              usuario: true,
            },
          },
          valoracion: true,
          asignaciones: {
            include: {
              tecnico: true,
            },
          },
        },
      });

      if (objTicket) {
        // Si asignaciones viene vacío, lo reemplazo por null
        const asignaciones =
          objTicket.asignaciones?.length > 0 ? objTicket.asignaciones : null;

        response.status(200).json({
          ...objTicket,
          asignaciones,
        });
      } else {
        next(AppError.notFound("No existe el Ticket"));
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

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;

      const newTicket = await this.prisma.ticket.create({
        data: {
          titulo: body.titulo,
          descripcion: body.descripcion,
          fecha_creacion: body.fecha_creacion,
          fecha_cierre: body.fecha_cierre,
          estado: body.estado,
          prioridad: body.prioridad, // 👈 ya viene como número
          id_categoria: body.id_categoria,
          id_usuario_cliente: body.id_usuario_cliente,

          Historial_Estados: {
            create: body.Historial_Estados.map((hist: any) => ({
              estado_anterior: hist.estado_anterior,
              nuevo_estado: hist.nuevo_estado,
              observaciones: hist.observaciones,
              fecha_cambio: hist.fecha_cambio,
              id_usuario: hist.id_usuario,

              Imagenes_Ticket: {
                create: hist.Imagenes_Ticket.map((img: any) => ({
                  ruta_imagen: img.ruta_imagen,
                })),
              },
            })),
          },
        },
        include: {
          Historial_Estados: {
            include: {
              Imagenes_Ticket: true,
            },
          },
        },
      });

      //Sacar el ultimo ticket creado el mas reciente
      if (body.aceptacion == "Si") {
        const ultimoTicket = await this.prisma.ticket.findFirst({
          orderBy: {
            id_ticket: "desc",
          },
        });

        //traer categoria
        const categoria = await this.prisma.categoria.findFirst({
          where: { id_categoria: ultimoTicket?.id_categoria },
          orderBy: {
            id_categoria: "desc",
          },
          include: {
            especialidades: true,
          },
        });

        const especialidadIds =
          categoria?.especialidades.map((e) => e.id_especialidad) ?? [];

        //Elegir el tecnico con menos carga de trabajo
        const tecnico = await this.prisma.usuario.findFirst({
          where: {
            id_rol: Role.TECNICO,
            activo: true,
            especialidades: {
              some: {
                id_especialidad: { in: especialidadIds },
              },
            },
          },
          orderBy: {
            carga_actual: "asc",
          },
          include: {
            especialidades: true,
          },
        });

        if (ultimoTicket && ultimoTicket.prioridad == "Alta" && tecnico) {
          if (tecnico) {
            const newAsignacionAutomatica = await this.prisma.asignacion.create(
              {
                data: {
                  fecha_asignacion: new Date(),
                  metodo: "Automatico",
                  id_ticket: ultimoTicket.id_ticket,
                  id_tecnico: tecnico.id_usuario,
                  id_reglaAutotriage: 5, // regla de asignacion automatica cuando se crea el ticket, al tecnico que tenga menos carga de trabajo y por prioridad alta
                },
              }
            );

            // Actualizar estado del ticket a "Asignado"
            const updateTicket = await this.prisma.ticket.update({
              where: { id_ticket: newTicket.id_ticket },
              data: { estado: "Asignado" },
            });

            const updateTecnico = await this.prisma.usuario.update({
              where: { id_usuario: tecnico.id_usuario },
              data: {
                carga_actual: {
                  increment: 1,
                },
              },
            });

            // Registrar en historial estados y asiganar una imagen por default
            await this.prisma.historial_Estado.create({
              data: {
                id_ticket: newTicket.id_ticket,
                estado_anterior: "Pendiente",
                nuevo_estado: "Asignado",
                observaciones: "Asignación automática por prioridad alta",
                fecha_cambio: new Date(),
                id_usuario: tecnico.id_usuario,
                Imagenes_Ticket: {
                  create: {
                    ruta_imagen: "asignado.jpg",
                  },
                },
              },
            });

            response.status(201).json({
              asignacion: newAsignacionAutomatica,
              ticket: updateTicket,
              tecnico: updateTecnico,
            });

            // hacer el update del ultimo ticket
          }
        }
      }
      response.status(201).json(newTicket);
    } catch (error) {
      console.error("Error creando ticket:", error);
      next(error);
    }
  };

  //Actualizar una Ticket
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;

      // Buscar técnico y ticket
      const tecnico = await this.prisma.usuario.findFirst({
        where: { id_usuario: body.id },
      });
      const ticket = await this.prisma.ticket.findFirst({
        where: { id_ticket: body.id_ticket },
      });

      if (!ticket || !tecnico) {
        return response
          .status(404)
          .json({ error: "Ticket o técnico no encontrado" });
      }

      // Construir data base para el update del ticket
      const ticketData: any = {
        estado: body.estado,
        Historial_Estados: {
          create: body.Historial_Estados.map((hist: any) => ({
            estado_anterior: hist.estado_anterior,
            nuevo_estado: hist.nuevo_estado,
            observaciones: hist.observaciones,
            fecha_cambio: hist.fecha_cambio,
            id_usuario: hist.id_usuario,
            Imagenes_Ticket: {
              create: hist.Imagenes_Ticket.map((img: any) => ({
                ruta_imagen: img.ruta_imagen,
              })),
            },
          })),
        },
      };

      // Si el estado es Cerrado, agrega campos extra
      if (body.estado === "Cerrado") {
        ticketData.fecha_cierre = new Date();
        ticketData.cumplimiento_respuesta = true;
        ticketData.cumplimiento_resolucion = true;
      }

      // Actualizar ticket
      const updateTicket = await this.prisma.ticket.update({
        where: { id_ticket: ticket.id_ticket },
        data: ticketData,
      });

      let updateTecnico = null;

      // ⚡ Usar el estado nuevo para decidir la carga
      switch (updateTicket.estado) {
        case "Asignado":
          updateTecnico = await this.prisma.usuario.update({
            where: { id_usuario: tecnico.id_usuario },
            data: {
              carga_actual: { increment: 1 },
            },
          });
          break;

        case "Resuelto":
          updateTecnico = await this.prisma.usuario.update({
            where: { id_usuario: tecnico.id_usuario },
            data: {
              carga_actual: { decrement: 1 },
            },
          });
          break;

        default:
          // otros estados no modifican carga_actual
          break;
      }
      if (updateTecnico) {
        const nuevoValor = updateTecnico.carga_actual;

        // Si carga_actual == 5 → disponible = false
        // Si carga_actual <= 4 → disponible = true
        const disponible = nuevoValor >= 5 ? false : true;

        updateTecnico = await this.prisma.usuario.update({
          where: { id_usuario: tecnico.id_usuario },
          data: { disponible: disponible },
        });
      }

      // ✅ Respuesta única y coherente
      return response.status(201).json({
        ticket: updateTicket,
        tecnico: updateTecnico,
        estadoDebug: updateTicket.estado,
      });
    } catch (error) {
      console.error("❌ Error en update:", error);
      next(error);
    }
  };

  //Reportes
  getTicketsPorMes = async (req: Request, res: Response) => {
    try {
      // 1. Traer todos los tickets (puedes filtrar por año si lo deseas)
      const tickets = await this.prisma.ticket.findMany({
        select: {
          id_ticket: true,
          fecha_creacion: true, // asegúrate que este campo exista
        },
      });

      // 2. Inicializar estructura de meses
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      const resultado: { mes: string; total: number }[] = meses.map((m) => ({
        mes: m,
        total: 0,
      }));

      // 3. Agrupar tickets por mes
      tickets.forEach((ticket) => {
        if (ticket.fecha_creacion) {
          const mesIndex = new Date(ticket.fecha_creacion).getMonth(); // 0-11
          resultado[mesIndex].total++;
        }
      });

      // 4. Responder al frontend
      res.json(resultado);
    } catch (error) {
      console.error("Error al obtener tickets por mes:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  };

getTicketsResolucionRespuesta = async (req: Request, res: Response) => {
  try {
    // Traer todos los tickets
    const tickets = await this.prisma.ticket.findMany();

    // Calcular totales
    const totalTickets = tickets.length;

    // Cumplimiento
    const totalRespuestaCumplen = tickets.filter(
      (t) => t.cumplimiento_respuesta === true
    ).length;
    const totalResolucionCumplen = tickets.filter(
      (t) => t.cumplimiento_resolucion === true
    ).length;

    // Incumplimiento
    const totalRespuestaIncumplen = tickets.filter(
      (t) => t.cumplimiento_respuesta === false
    ).length;
    const totalResolucionIncumplen = tickets.filter(
      (t) => t.cumplimiento_resolucion === false
    ).length;

    // Calcular porcentajes (sobre el total de tickets)
    const porcentajeRespuestaCumplen =
      totalTickets > 0 ? (totalRespuestaCumplen / totalTickets) * 100 : 0;
    const porcentajeResolucionCumplen =
      totalTickets > 0 ? (totalResolucionCumplen / totalTickets) * 100 : 0;

    const porcentajeRespuestaIncumplen =
      totalTickets > 0 ? (totalRespuestaIncumplen / totalTickets) * 100 : 0;
    const porcentajeResolucionIncumplen =
      totalTickets > 0 ? (totalResolucionIncumplen / totalTickets) * 100 : 0;

    // JSON de salida
    const indicadores = {
      slaRespuesta: {
        cumplimiento: porcentajeRespuestaCumplen.toFixed(2),
        incumplimiento: porcentajeRespuestaIncumplen.toFixed(2),
      },
      slaResolucion: {
        cumplimiento: porcentajeResolucionCumplen.toFixed(2),
        incumplimiento: porcentajeResolucionIncumplen.toFixed(2),
      },
      detalle: tickets.map((t) => ({
        id_ticket: t.id_ticket,
        titulo: t.titulo,
        cumplimiento_respuesta: t.cumplimiento_respuesta,
        cumplimiento_resolucion: t.cumplimiento_resolucion,
      })),
    };

    res.json(indicadores);
  } catch (error) {
    console.error("Error al obtener tickets por mes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

}
