import axios from 'axios';
import { User } from '../types/user.types';

const API_URL = process.env.REACT_APP_API;

// Consultar de los usuarios con rol de 'guardia'
export const getGuards = async () => {
  try {
    const response = await axios.get(`${API_URL}/guards`);
    console.log(`Se obtuvieron los datos`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo los datos de guardias`, error);
    throw error;
  }
};

// Consulta de los usuarios con rol de 'residente'
export const getResidents = async () => {
  try {
    const response = await axios.get(`${API_URL}/residents`);
    console.log(`Se obtuvieron los datos`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo los datos de residentes:', error);
    throw error;
  }
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el usiario`, error);
    throw error;
  }
};

// Subir imagen de documento de identidad
export const uploadUserDocumentImage = async (
  userId: string,
  imageFile: File
): Promise<{ message: string; documentImage: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${API_URL}/users/${userId}/upload-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error al subir imagen de documento:`, error);
    throw error;
  }
};

// Subir imagen de placa de vehículo
export const uploadUserVehiclePlateImage = async (
  userId: string,
  imageFile: File
): Promise<{ message: string; vehiclePlateImage: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${API_URL}/users/${userId}/upload-vehicle-plate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error al subir imagen de placa:`, error);
    throw error;
  }
};
