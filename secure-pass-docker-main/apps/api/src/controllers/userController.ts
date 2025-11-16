import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { Admin, Guard, GuardShift, Resident } from "../interfaces/IUser";

export const userController = {
  async getResidents(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUsersByRole("residente");

      const residents = users as Resident[];

      res.json(
        residents.map((resident) => ({
          _id: resident._id,
          name: resident.name,
          email: resident.auth.email,
          apartment: resident.apartment,
          tel: resident.tel,
          registerDate: resident.registerDate,
        }))
      );
    } catch (error) {
      next(error);
    }
  },

  async getGuards(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUsersByRole("guardia");

      const guards = users as Guard[];

      res.json(
        guards.map((guard) => ({
          _id: guard._id,
          name: guard.name,
          email: guard.auth.email,
          shift: guard.shift,
          registerDate: guard.registerDate,
        }))
      );
    } catch (error) {
      next(error);
    }
  },

  async getAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUsersByRole("admin");

      const admins = users as Admin[];

      res.json(
        admins.map((admin) => ({
          _id: admin._id,
          name: admin.name,
          email: admin.auth.email,
          lastAccess: admin.lastAccess,
          registerDate: admin.registerDate,
        }))
      );
    } catch (error) {
      next(error);
    }
  },

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await UserService.findById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();

      const response = users.map((user) => {
        const baseResponse = {
          _id: user._id,
          name: user.name,
          email: user.auth.email,
          role: user.role,
          registerDate: user.registerDate,
          updateDate: user.updateDate,
        };

        // Propiedades específicas de roles
        switch (user.role) {
          case "residente":
            return {
              ...baseResponse,
              apartment: (user as Resident).apartment,
              tel: (user as Resident).tel,
            };
          case "guardia":
            return {
              ...baseResponse,
              shift: (user as Guard).shift,
            };
          case "admin":
            return {
              ...baseResponse,
              lastAccess: (user as Admin).lastAccess,
            };
          default:
            return baseResponse;
        }
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validaciones específicas por rol
      if (
        updateData.role === "residente" &&
        (!updateData.apartment || !updateData.tel)
      ) {
        res
          .status(400)
          .json({
            message: "Apartamento y teléfono son requeridos para residentes",
          });
        return;
      }

      if (updateData.role === "guardia" && !updateData.shift) {
        res.status(400).json({ message: "Turno es requerido para guardias" });
        return;
      }

      const updatedUser = await UserService.updateUser(id, updateData);

      if (!updatedUser) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      // Construir respuesta según el rol
      const userResponse = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.auth.email,
        role: updatedUser.role,
        ...(updatedUser.role === "residente" && {
          apartment: updatedUser.apartment,
          tel: updatedUser.tel,
        }),
        ...(updatedUser.role === "guardia" && {
          shift: updatedUser.shift,
        }),
        ...(updatedUser.role === "admin" && {
          lastAccess: updatedUser.lastAccess,
        }),
        updateDate: updatedUser.updateDate,
      };

      res.json(userResponse);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedUser = await UserService.deleteUser(id);

      if (!deletedUser) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      const user = {
        _id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.auth.email,
        role: deletedUser.role,
      };
      res.json({ message: "Usuario eliminado correctamente", user });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async assignRoleToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        res.status(400).json({ message: "El roleId es requerido" });
        return;
      }

      const updatedUser = await UserService.assignRole(id, roleId);

      if (!updatedUser) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  },

  async getAllUsersWithRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsersWithRoles();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },
};
