import { usuarios } from "./seeds/usuarios";
import { especialidades } from "./seeds/especialidades";
import { slas } from "./seeds/sla";
import { etiquetas } from "./seeds/etiquetas";
import { reglasAutotriage } from "./seeds/reglasAutotriage";
import { PrismaClient, Role } from "../generated/prisma";
import { prioridades } from "./seeds/prioridades";

const prisma = new PrismaClient();
const main = async () => {
  try {
    //Prioridades - no tiene relaciones
    await prisma.prioridad.createMany({
      data: prioridades,
    });
    //Usuarios - no tiene relaciones
    await prisma.usuario.createMany({
      data: usuarios,
    });
    //Especialidad - no tiene relaciones
    await prisma.especialidad.createMany({
      data: especialidades,
    });

    //sla - no tiene relaciones
    await prisma.sla.createMany({
      data: slas,
    });

    //etiquetas - no tiene relaciones
    await prisma.etiqueta.createMany({
      data: etiquetas,
    });
    
     //Reglas autotriage - no tiene relaciones
    await prisma.reglas_Autotriage.createMany({
      data: reglasAutotriage,
    });
    

    //Que si tienen relaciones

    // Categorias
    await prisma.categoria.create({
      //Instancia de Categoria 1
      data: {
        nombre: "Hardware",
        descripcion: "Equipos que no encienden o presentan daños físicos",
        id_sla: 2, // SLA Medio
        etiquetas: {
          connect: [{id_etiqueta: 1}, {id_etiqueta: 2}, {id_etiqueta: 3}, {id_etiqueta: 4}, {id_etiqueta: 5}, {id_etiqueta: 6},{id_etiqueta: 7}],
        },
        especialidades:{
          connect: [{id_especialidad: 1}, {id_especialidad: 2}, {id_especialidad: 3}],
        },
      },
    });

     await prisma.categoria.create({
      //Instancia de Categoria 2
      data: {
        nombre: "Software",
        descripcion: "Aplicaciones institucionales que no funcionan correctamente",
        id_sla: 3,
        etiquetas: {
          connect: [{id_etiqueta: 8}, {id_etiqueta: 9}, {id_etiqueta: 10}, {id_etiqueta: 11}, {id_etiqueta: 12}, {id_etiqueta: 13},{id_etiqueta: 14}],
        },
        especialidades:{
          connect: [{id_especialidad: 4}, {id_especialidad: 5}, {id_especialidad: 6}],
        },
      },
    });

    await prisma.categoria.create({
      //Instancia de Categoria 3
      data: {
        nombre: "Infraestructura",
        descripcion: "Mantenimiento eléctrico o estructural en aulas y laboratorios",
        id_sla: 1, // SLA Bajo
         etiquetas: {
          connect: [{id_etiqueta: 14}, {id_etiqueta: 15}, {id_etiqueta: 16}, {id_etiqueta: 17}, {id_etiqueta: 18}, {id_etiqueta: 19},{id_etiqueta: 20}],
        },
        especialidades:{
          connect: [{id_especialidad: 7}, {id_especialidad: 8}, {id_especialidad: 9}],
        },
      },
    });

    await prisma.categoria.create({
      //Instancia de Categoria 4
      data: {
        nombre: "Problemas de Red",
        descripcion: "Reportes de fallas en la conectividad Wi-Fi o cableado",
        id_sla: 3, // SLA Alto
        etiquetas: {
          connect: [{id_etiqueta: 21}, {id_etiqueta: 22}, {id_etiqueta: 23}, {id_etiqueta: 24}, {id_etiqueta: 25}, {id_etiqueta: 26},{id_etiqueta: 27}],
        },
        especialidades:{
          connect: [{id_especialidad: 10}, {id_especialidad: 11}, {id_especialidad: 12}],
        },
      },
    });

    //Fin de las Categorias
    
    //Instancia de Usuarios para crear los tecnicos con sus respectivas especialidades
    //Tecnico 1 Experto en hardware
    await prisma.usuario.create({
      data: {
        nombre: "Carlos Técnico",
        correo: "carlos.tecnico@centroedu.com",
        contrasena: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        id_rol: Role.TECNICO, // Técnico
        carga_actual: 1,
        disponible: true,
        especialidades: {
          connect: [{ id_especialidad: 1 }, { id_especialidad: 2 }, { id_especialidad: 3 }],
        }
      },
    });

    //Tecnico 2 Experto em Software
    await prisma.usuario.create({
      data: {
        nombre: "Javier Tecnico",
        correo: "javier.cliente@centroedu.com",
        contrasena: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        id_rol: Role.TECNICO, // Tecnico
        carga_actual: 1,
        disponible: true,
        especialidades: {
          connect: [{ id_especialidad: 4 }, { id_especialidad: 5 }, { id_especialidad: 6 }],
        }
      },
    });

    //Tecnico 3 Infraestructura
    await prisma.usuario.create({
      data: {
        nombre: "Sebastian Tecnico",
        correo: "sebas.cliente@centroedu.com",
        contrasena: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        id_rol: Role.TECNICO, // Tecnico
        carga_actual: 1,
        disponible: true,
        especialidades: {
          connect: [{ id_especialidad: 7 }, { id_especialidad: 8 }, { id_especialidad: 9 }],
        }
      },
    });

    //Tecnico 4 Experto en redes
    await prisma.usuario.create({
      data: {
        nombre: "Oscar Tecnico",
        correo: "oscar.cliente@centroedu.com",
        contrasena: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
        id_rol: Role.TECNICO, // Tecnico
        disponible: true,
        especialidades: {
          connect: [{ id_especialidad: 10 }, { id_especialidad: 11 }, { id_especialidad: 12 }],
        }
      },
    });

    //Fin del insert de tecnicos

    //Instancia de Ticket 1
    await prisma.ticket.create({
      data: {
        titulo: "Falla en Wi-Fi del laboratorio",
        descripcion: "Los equipos del laboratorio 2 no tienen conexión a internet",
        estado: "Pendiente",
        prioridad: "Alta",
        id_usuario_cliente: 2, // Ian
        id_categoria: 4,
      },
    });

    //Instancia de Ticket 2
    await prisma.ticket.create({
      data: {
        titulo: "Computadora no enciende",
        descripcion: "El equipo del aula 5 presenta falla al iniciar",
        fecha_creacion: new Date("2025-11-10 12:41:34.271"), 
        estado: "Asignado",
        prioridad: "Media",
        id_usuario_cliente: 3,
        id_categoria: 1,
      },
    });

    //Instancia de Ticket 3
    await prisma.ticket.create({
      data: {
        titulo: "Error en Moodle",
        descripcion: "El sistema no permite subir tareas ni calificaciones",
        fecha_creacion: new Date("2025-11-10 15:41:34.271"), 
        estado: "En Proceso",
        prioridad: "Alta",
        id_usuario_cliente: 4,
        id_categoria: 2,
      },
    });

    //Instancia de Ticket 4
    await prisma.ticket.create({
      data: {
        titulo: "Escritorios dañados y viejos",
        descripcion: "Los Escritorios del laboratorio 5 estan muy dañados, espero un dia los cambien",
        fecha_creacion: new Date("2025-11-8 15:41:34.271"),
        estado: "Resuelto",
        prioridad: "Baja",
        id_usuario_cliente: 3,
        id_categoria: 3,
      },
    });

    //Instancia de Ticket 5
    await prisma.ticket.create({
      data: {
        titulo: "Actualizacion de Software",
        descripcion: "Debemos actualizar a windows 11",
        fecha_creacion: new Date("2025-11-7 15:41:34.271"),
        fecha_cierre: new Date("2025-11-10 22:41:34.271"), 
        estado: "Cerrado",
        prioridad: "Baja",
        id_usuario_cliente: 2,
        id_categoria: 2,
        cumplimiento_respuesta: true,
        cumplimiento_resolucion: true,
      },
    });
    //Fin de tickets

    //Instancia de asiganacion de ticket 2
    await prisma.asignacion.create({
      data: {
        id_ticket: 2,
        id_tecnico: 5, // Carlos experto en hardware
        metodo: "Automatica",
        id_reglaAutotriage: 3,
      },
    });

     //Instancia de asiganacion de ticket 3
    await prisma.asignacion.create({
      data: {
        id_ticket: 3,
        id_tecnico: 6, // Javier experto en software
        metodo: "Manual",
      },
    });

     //Instancia de asiganacion de ticket 4
    await prisma.asignacion.create({
      data: {
        id_ticket: 4,
        id_tecnico: 7, // Sebastian experto en Infraestructura
        metodo: "Manual",
      },
    });

     //Instancia de asiganacion de ticket 5
    await prisma.asignacion.create({
      data: {
        id_ticket: 5,
        id_tecnico: 6, // Javier experto en Software
        metodo: "Automatica",
      },
    });

    //Fin de Asignacion

    //Instancia de Estado de Tickets 1
    await prisma.historial_Estado.create({
      data: {
        id_ticket: 1,
        estado_anterior: null,
        nuevo_estado: "Pendiente",
        observaciones: "Ticket creado por el usuario, en espera de asignación.",
        id_usuario: 2, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    //Instancia de Estado de Tickets 2
    await prisma.historial_Estado.create({
      data: {
        id_ticket: 2,
        estado_anterior: null,
        nuevo_estado: "Pendiente",
        observaciones: "Ticket creado por el usuario, en espera de asignación.",
        id_usuario: 3, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    await prisma.historial_Estado.create({
      data: {
        id_ticket: 2,
        estado_anterior: "Pendiente",
        nuevo_estado: "Asignado",
        observaciones: "Ticket asignado al técnico de hardware.",
        id_usuario: 1, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    //Instancia de Estado de Tickets 3
    await prisma.historial_Estado.create({
      data: {
        id_ticket: 3,
        estado_anterior: null,
        nuevo_estado: "Pendiente",
        observaciones: "Ticket creado por el usuario, en espera de asignación.",
        id_usuario: 4, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    await prisma.historial_Estado.create({
      data: {
        id_ticket: 3,
        estado_anterior: "Pendiente",
        nuevo_estado: "Asiganado",
        observaciones: "Ticket asignado al técnico de software académico.",
        id_usuario: 1, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });
    
     await prisma.historial_Estado.create({
      data: {
        id_ticket: 3,
        estado_anterior: "Asiganado",
        nuevo_estado: "En Proceso",
        observaciones: "El técnico inició la revisión del error en Moodle.",
        id_usuario: 6, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    //Instancia de Estado de Tickets 4
    await prisma.historial_Estado.create({
      data: {
        id_ticket: 4,
        estado_anterior: null,
        nuevo_estado: "Pendiente",
        observaciones: "Ticket creado por el usuario, en espera de asignación.",
        id_usuario: 3, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

     await prisma.historial_Estado.create({
      data: {
        id_ticket: 4,
        estado_anterior: "Pendiente",
        nuevo_estado: "Asignado",
        observaciones: "Ticket asignado al técnico de infraestructura.",
        id_usuario: 1, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    await prisma.historial_Estado.create({
      data: {
        id_ticket: 4,
        estado_anterior: "Asignado",
        nuevo_estado: "En Proceso",
        observaciones: "El técnico está revisando los escritorios dañados.",
        id_usuario: 7, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    await prisma.historial_Estado.create({
      data: {
        id_ticket: 4,
        estado_anterior: "En Proceso",
        nuevo_estado: "Resuelto",
        observaciones: "Los escritorios fueron reemplazados.",
        id_usuario: 7, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    //Instancia de Estado de Tickets 5
    await prisma.historial_Estado.create({
      data: {
        id_ticket: 5,
        estado_anterior: null,
        nuevo_estado: "Pendiente",
        observaciones: "Ticket creado por el usuario, en espera de asignación.",
        id_usuario: 2, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

     await prisma.historial_Estado.create({
      data: {
        id_ticket: 5,
        estado_anterior: "Pendiente",
        nuevo_estado: "Asignado",
        observaciones: "Ticket asignado al técnico de Software.",
        id_usuario: 1, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    await prisma.historial_Estado.create({
      data: {
        id_ticket: 5,
        estado_anterior: "Asignado",
        nuevo_estado: "En Proceso",
        observaciones: "El técnico está actualizando a windows 11.",
        id_usuario: 6, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    await prisma.historial_Estado.create({
      data: {
        id_ticket: 5,
        estado_anterior: "En Proceso",
        nuevo_estado: "Resuelto",
        observaciones: "Todas las pc tienen windows 11 intalado",
        id_usuario: 6, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });

    await prisma.historial_Estado.create({
      data: {
        id_ticket: 5,
        estado_anterior: "Resuelto",
        nuevo_estado: "Cerrado",
        observaciones: "Ya revisé que todas las pc tuvieras las actualizaciones",
        id_usuario: 2, //este id de usuario de refiere al tecnico que modifico el estado o si fue el admnistrador o por ejemplo el usuario que inicio el ticket en pendiente
      },
    });


    // Fin de los estado de cada ticket 

     // Valoracion para el unico ticket resuelto #4
    await prisma.valoracion.create({
      data:  { id_ticket: 5, puntuacion: 5, comentario: "Excelente ya hay windows 11 en todas las compoutadoras, muchas gracias" },
    });

    //Insertar las imagenes de los estados de los tickets registrados
    //Ticket 1
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 1, ruta_imagen: "pendiente.jpg" },
    });

    //Ticket 2
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 2, ruta_imagen: "pendiente.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 3, ruta_imagen: "asignado.jpg" },
    });

    //Ticket 3
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 4, ruta_imagen: "pendiente.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 5, ruta_imagen: "asignado.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 6, ruta_imagen: "en proceso.jpg" },
    });

    //Ticket 4
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 7, ruta_imagen: "pendiente.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 8, ruta_imagen: "asignado.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 9, ruta_imagen: "en proceso.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 10, ruta_imagen: "en resuelto.jpg" },
    });
    //Ticket 5
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 11, ruta_imagen: "pendiente.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 12, ruta_imagen: "asignado.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 13, ruta_imagen: "en proceso.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 14, ruta_imagen: "en resuelto.jpg" },
    });
    await prisma.imagen_Ticket.create({
      data:  { id_historial: 15, ruta_imagen: "cerrado.jpg" },
    });

    //Fin de las imagenes de los tickets

    //Notificacion 1 por la asignacion del ticket 
    await prisma.notificacion.create({
      data: {
        id_remitente: 1, // Carlos
        id_destinatario: 3, // Eddy
        tipo: "Actualización de Ticket",
        mensaje: "Tu ticket #1 fue asignado al técnico Carlos Rodríguez.",
      },
    });

    //Notificacion 2 por que el tecnico calor esta revisando el ticket
    await prisma.notificacion.create({
      data: {
        id_remitente: 5, // Carlos tecnico
        id_destinatario: 3,
        tipo: "Actualización de Ticket",
        mensaje: "El ticket #2 está siendo revisado.",
      },
    });

    //Notificacion 3 por que el tecnico calor esta revisando el ticket
    await prisma.notificacion.create({
      data: {
        id_remitente: 1, // Admin
        id_destinatario: 6, // Tecnico Javier de Software
        tipo: "Nueva Asignación",
        mensaje: "Se te ha asignado el ticket #3.",
        },
    });

    //Notificacion 3 por que el tecnico calor esta revisando el ticket
    await prisma.notificacion.create({
      data: {
        id_remitente: 7,
        id_destinatario: 3,
        tipo: "Cambio de Estado",
        mensaje: "El ticket #4 ha sido resuelto exitosamente.",
        },
    });
  } catch (error) {
    throw error;
  }
};
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })