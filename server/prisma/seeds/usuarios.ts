import { Role } from "../../generated/prisma";

export const usuarios = [
  {
    nombre: "Administrador",
    correo: "admin@centroedu.com",
    contrasena: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    id_rol: Role.ADMIN, // Administrador
  },
  {
    nombre: "Ian Cliente",
    correo: "ian.cliente@centroedu.com",
    contrasena: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    id_rol: Role.USER, // Usuario Cliente
  },
  {
    nombre: "Eddy Cliente",
    correo: "eddy.cliente@centroedu.com",
    contrasena: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    id_rol: Role.USER, // Usuario Cliente
  },
  {
    nombre: "Josue Cliente",
    correo: "josue.cliente@centroedu.com",
    contrasena: "$2b$10$1BaQqXuZYNLDAC42PY5fN.ufSOKjApmjkaZrQUYf7ms71PaS1mASO",
    id_rol: Role.USER, // Usuario Cliente
  },
];

