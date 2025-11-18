import { User } from "./user.types";

export type RootStackParamList = {
  Login: undefined;

  // Pantallas principales según rol
  Main: undefined;
  ResidentMain: undefined;
  GuardMain: undefined;
  AdminMain: undefined;

  // Pantallas de Guardia
  Scanner: {
    state: "entry" | "exit";
  };
  EntryForm: { qrData: string };
  ExitRegistration: {
    onScanned?: (value: string) => void;
    token: string;
    qrData?: string;
  };
  ResidentList: {
    user: User;
  };
  ResidentDetail: {
    resident: User;
  };

  // Pantallas de Residente
  ResidentDashboard: undefined;
  AuthorizeVisit: undefined;
  VisitHistory: undefined;
  VisitDetail: {
    visitId: string;
  };
  QRDisplay: {
    visitId: string;
    qrId: string;
  };
  ManageSubscription: undefined;
  PaymentHistory: undefined;

  // Pantallas de Admin
  AdminDashboard: undefined;
  Analytics: undefined;
  UserManagement: undefined;
  CreateUser: undefined;
  EditUser: {
    userId: string;
  };
  Reports: undefined;

  // Pantallas compartidas
  Profile: undefined;
  Settings: undefined;
};
