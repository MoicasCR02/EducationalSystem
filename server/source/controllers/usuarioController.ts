import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { AppError } from "../errors/custom.error";
import { Usuario, PrismaClient, Role } from "../../generated/prisma";
import passport from "passport";
import { generateToken } from "../config/authUtils";


export class usuarioController {
  prisma = new PrismaClient();

    register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, correo, contrasena, role } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(contrasena, salt);

      const user = await this.prisma.usuario.create({
        data: {
          nombre,
          correo,
          contrasena: hash,
          id_rol: Role[role as keyof typeof Role],
        },
      });

      res.status(201).json({
        success: true,
        message: "Usuario creado",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

login = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { session: false },
    async (
      err: Error | null,
      user: Express.User | false | null,
      info: { message?: string }
    ) => {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: info.message });
      }

      try {
        // Actualizar último inicio de sesión
        await this.prisma.usuario.update({
          where: {
            id_usuario: (user as Usuario).id_usuario, // usa el id del usuario autenticado
          },
          data: {
            ultimo_inicio_sesion: new Date(),
          },
        });

        // Generar token
        const token = generateToken(user as Usuario);

        return res.json({
          success: true,
          message: "Inicio de sesión exitoso",
          token,
        });
      } catch (updateError) {
        return next(updateError);
      }
    }
  )(req, res, next);
};


  userAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuario = req.user as Usuario;
      res.json(usuario);

    } catch (error) {
      next(error);
    }
  };

   // Listado de usuarios
  getUsuarios = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const listado = await this.prisma.usuario.findMany({
        orderBy: {
          id_usuario: "asc",
        },
        include: {
          especialidades: true,
        },
      });
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };
  
  // Listado de Técnicos
  getByUser = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const listado = await this.prisma.usuario.findMany({
        where: {
          id_rol: "TECNICO", //Filtra solo los técnicos
        },
        orderBy: {
          id_usuario: "asc",
        },
        include: {
          especialidades: true,
        },
      });
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  getByCorreo = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const correo = request.params.correo; // 👈 o request.query.correo según tu ruta

    if (!correo) {
      return response.status(400).json({ error: "Debe proporcionar un correo" });
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: correo },
    });

    if (!usuario) {
      return response.status(404).json({ error: "Usuario no encontrado" });
    }

    return response.json(usuario);
  } catch (error) {
    console.error("❌ Error en getByCorreo:", error);
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

  // Listado de Técnicos
  getByCategoria = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const idTicket = Number(request.params.idCategoria);

      const Ticket = await this.prisma.ticket.findUnique({
        where: {
          id_ticket: idTicket,
        },
        include:{
          categoria:true,
        }
      });

      //Buscar en categoria etiquetas relacionadas con la categoria
      const categoria = await this.prisma.categoria.findFirst({
        where: { id_categoria: Ticket?.id_categoria },
        orderBy: {
          id_categoria: "desc",
        },
        include: {
          especialidades: true,
        },
      });

      const especialidadIds = categoria?.especialidades.map((e) => e.id_especialidad) ?? [];

      //Elegir el tecnico con menos carga de trabajo
        const tecnicos = await this.prisma.usuario.findMany({
          where: {
            id_rol: Role.TECNICO,
            activo: true,
            especialidades: {
              some: {
                id_especialidad: { in: especialidadIds },
              },
            },
          },
          include: {
            especialidades: true,
          },
        });

      response.json({ticket: Ticket,tecnicos: tecnicos,});
    } catch (error) {
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

  //Crear

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const hashedPassword = await bcrypt.hash(body.contrasena, 10); // 10 = salt rounds
      const newTecnico = await this.prisma.usuario.create({
        data: {
          nombre: body.nombre,
          correo: body.correo,
          contrasena: hashedPassword,
          activo: body.activo === 1,
          carga_actual: 0,
          especialidades: {
            connect: body.especialidades,
          },
          id_rol: Role.TECNICO,
          disponible: true,
        },
      });
      response.status(201).json(newTecnico);
    } catch (error) {
      console.error("Error creando Tecnico:", error);
      next(error);
    }
  };

  createUsuario = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const hashedPassword = await bcrypt.hash(body.contrasena, 10); // 10 = salt rounds
      const newTecnico = await this.prisma.usuario.create({
        data: {
          nombre: body.nombre,
          correo: body.correo,
          contrasena: hashedPassword,
          activo: body.activo === 1,
          id_rol: body.id_rol,
          disponible: true,
        },
      });
      response.status(201).json(newTecnico);
    } catch (error) {
      console.error("Error creando Usuario:", error);
      next(error);
    }
  };
  //Actualizar una categoria
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const idTecnico = parseInt(request.params.id);

      //Obtener categoria anterior
      const TecnicoExistente = await this.prisma.usuario.findUnique({
        where: { id_usuario: idTecnico },
        include: {
          especialidades: {
            select: {
              id_especialidad: true,
            },
          },
        },
      });
      if (!TecnicoExistente) {
        response.status(404).json({ message: "El tecnico no existe" });
        return;
      }

      // Desconectar etiquetas antiguas y conectar las nuevas
      const disconnectEspecialidades = TecnicoExistente.especialidades.map(
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
      const updateTecnico = await this.prisma.usuario.update({
        where: {
          id_usuario: idTecnico,
        },
        data: {
          nombre: body.nombre,
          correo: body.correo,
          activo: body.activo === 1 ? true : false,
          especialidades: {
            disconnect: disconnectEspecialidades,
            connect: connectEspecialidades,
          },
        },
      });

      response.json(updateTecnico);
    } catch (error) {
      next(error);
    }
  };
}
