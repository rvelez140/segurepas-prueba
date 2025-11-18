import { User } from "./user.types";

export type RootStackParamList = {
  Login: undefined;

  Main: undefined;

  Scanner: {
    state: "entry" | "exit";
  };

  ResidentDetail: {
    resident: User;
  };

  EntryForm: { qrData: string };

  ResidentList: {
    user: User;
  };

  ExitRegistration: {
    onScanned?: (value: string) => void;
    token: string;
    qrData?: string;
  };
};
