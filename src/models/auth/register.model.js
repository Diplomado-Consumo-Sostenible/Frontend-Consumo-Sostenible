export const registerModel = (data) => {
  return {
    email: data.email,
    password: data.password,
    rolId: 2,
    nombre: data.nombre,
    id_genero: Number(data.id_genero),
  };
};