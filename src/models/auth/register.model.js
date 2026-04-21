export const registerModel = (data) => {
  return {
      email: data.email,
      password: data.password,
      rolId: data.roleId,
      nombre: data.nombre,
      id_genero: Number(data.id_genero),
  };
};