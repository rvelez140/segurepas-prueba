import axios from "axios";
import { User } from "../types/user.types";
import Constants from "expo-constants"

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export const getResidents = async () : Promise<User[]> => {
    try {
        const response = await axios.get<User[]>(`${API_URL}/residents`);
        const residents = response.data.map((resident: any) => ({
      ...resident,
      registerDate: new Date(resident.registerDate),
    }))
        return residents;
    }catch(error){
        console.error('Error al obtener los residentes');
        throw error;
    }
}