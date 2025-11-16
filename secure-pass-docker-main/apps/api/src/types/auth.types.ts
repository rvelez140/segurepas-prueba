import { Request } from "express";
import { IUser } from "../interfaces/IUser";

interface JwtPayload {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}