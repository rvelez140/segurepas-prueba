import { Request } from "express";
import { IUser } from "../interfaces/IUser";
import { ICompany } from "../interfaces/ICompany";
import { Types } from "mongoose";

interface JwtPayload {
  id: string;
  companyId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  company?: ICompany;
  companyId?: Types.ObjectId;
}