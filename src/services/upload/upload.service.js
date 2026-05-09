import API from '../../api/api';

const DEFAULT_VALIDATION = {
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeMb: 5,
};

export function validateImageFile(file, config = {}) {
  const { allowedTypes, maxSizeMb } = { ...DEFAULT_VALIDATION, ...config };

  if (!allowedTypes.includes(file.type)) {
    const exts = allowedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ');
    return `Formato no permitido. Usa: ${exts}.`;
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return `El archivo no puede superar los ${maxSizeMb} MB.`;
  }
  return null;
}

function isCanceled(error) {
  return error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
}

async function postImage(endpoint, file, { onProgress, signal } = {}) {
  const formData = new FormData();
  formData.append('imagen', file);
  try {
    const response = await API.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal,
      onUploadProgress: onProgress
        ? ({ loaded, total }) => onProgress(Math.round((loaded / total) * 100))
        : undefined,
    });
    return response.data;
  } catch (error) {
    if (isCanceled(error)) throw { canceled: true, message: 'Subida cancelada' };
    throw error.response?.data || { message: 'Error al subir la imagen' };
  }
}

export const uploadProfileImage = (file, options = {}) =>
  postImage('/upload', file, options);

export const uploadGeneralImage = (file, options = {}) =>
  postImage('/upload/general', file, options);
