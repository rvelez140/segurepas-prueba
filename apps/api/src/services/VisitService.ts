import { Visit } from "../models/Visit";
import { IVisit, IVisitInput, VisitState } from "../interfaces/IVisit";
import mongoose, { Types } from "mongoose";
import { UserService } from "./UserService";
import { IUser } from "../interfaces/IUser";
import { IReport } from "../interfaces/IReport";
import { flattenObject } from "../types/express.types";
import { notificationService } from "./NotificationService";

export class VisitService {
  static async createVisit(visitData: IVisitInput): Promise<IVisit> {
    // Verificar que el residente existe y es residente
    const resident = await UserService.findById(
      visitData.authorization.resident
    );
    if (!resident) {
      throw new Error("Usuario no válido");
    }

    // Verificar si existe una visita activa con el mismo documento
    const existingVisit = await Visit.findOne({
      "visit.document": visitData.visit.document,
      "authorization.state": {
        $nin: [VisitState.COMPLETE, VisitState.DENIED, VisitState.EXPIRED],
      },
    });

    if (existingVisit) {
      throw new Error(
        `Ya existe una visita activa con el documento ${visitData.visit.document}`
      );
    }

    // Por defecto la visita expirará en 15 días
    let e = new Date();
    e.setDate(e.getDate() + 15);

    // Crear la visita con estado inicial
    const visit = await Visit.create({
      ...visitData,
      qrId: this.generateQRId(),
      "authorization.state": VisitState.PENDING,
      "authorization.date": new Date(),
      "authorization.exp": e,
    });

    return visit.populate("authorization.resident", "name apartment");
  }

  static async updateVisitData(
    document: string,
    updateData: Partial<Omit<IVisitInput, "_id">>
  ) {
    const flattenedUpdate = flattenObject({
      ...updateData,
      updateDate: new Date(),
    });

    const result = await Visit.updateMany(
      { "visit.document": document },
      { $set: flattenedUpdate },
      { new: true }
    ).exec();

    if (result.modifiedCount === 0) return [];

    return this.getLatestVisitByDocument(document);
  }

  static async registerEntry(
    qrId: string,
    guardId: Types.ObjectId,
    status: VisitState,
    note?: string
  ): Promise<IVisit | null> {
    const visit = await Visit.findOne({ qrId });
    if (!visit) throw new Error("Visita no encontrada");

    // Verificar que la visita tiene un estado válido para ser registrada
    if (visit.authorization.state !== VisitState.PENDING)
      throw new Error("La visita no está pendiente para registrar entrada");

    // Verificar que el guardia existe
    const guard = await UserService.findById(guardId);
    if (!guard || guard.role == "residente") {
      throw new Error("Guardia no válido");
    }

    const validState = (value: string): boolean => {
      return Object.values(VisitState).includes(value as VisitState);
    };

    if (!validState(status)) throw new Error("Estado introducido no válido");

    const updatedVisit = await Visit.findByIdAndUpdate(
      visit._id,
      {
        $set: {
          "authorization.state": status,

          "registry.entry": {
            guard: guardId,
            date: new Date(),
            note: note ? note : undefined,
          },
        },
        $unset: {
          "authorization.exp": 1,
        },
      },
      { new: true }
    ).populate("authorization.resident", "name apartment");

    // Enviar notificación por correo si la entrada fue aprobada
    if (updatedVisit && status === VisitState.APPROVED) {
      try {
        const residentData = (await UserService.findById(
          updatedVisit.authorization.resident
        )) as IUser;

        await notificationService.sendEntryRegistrationNotification(
          residentData.auth.email,
          updatedVisit.visit.email,
          updatedVisit,
          guard.name
        );
      } catch (emailError) {
        // Log del error pero no fallar el registro de entrada
        console.error("Error al enviar notificación de entrada:", emailError);
      }
    }

    return updatedVisit;
  }

  static async registerExit(
    qrId: string,
    guardId: Types.ObjectId,
    note?: string
  ): Promise<IVisit | null> {
    const visit = await Visit.findOne({ qrId });
    if (!visit) throw new Error("Visita no encontrada");
    if (visit.authorization.state !== VisitState.APPROVED) {
      throw new Error("La visita no está aprobada para registrar salida");
    }

    // Verificar que el guardia existe
    const guard = await UserService.findById(guardId);
    if (!guard || guard.role == "residente") {
      throw new Error("Guardia no válido");
    }

    return await Visit.findByIdAndUpdate(
      visit._id,
      {
        $set: {
          "registry.exit": {
            guard: guardId,
            date: new Date(),
            note,
          },
          "authorization.state": VisitState.COMPLETE,
        },
      },
      { new: true }
    ).populate("authorization.resident", "name apartment");
  }

  static async updateVisitImagesByDocument(
    document: string,
    imageUrl: string
  ): Promise<IVisit[]> {
    const result = await Visit.updateMany(
      { "visit.document": document },
      { $set: { "visit.visitImage": imageUrl } }
    );

    if (result.modifiedCount === 0) return [];

    return this.getVisitsByDocument(document);
  }

  static async updateVehicleImagesByDocument(
    document: string,
    imageUrl: string
  ): Promise<IVisit[]> {
    const result = await Visit.updateMany(
      { "visit.document": document },
      { $set: { "visit.vehicleImage": imageUrl } }
    );

    if (result.modifiedCount === 0) return [];

    return this.getVisitsByDocument(document);
  }

  static async updateAllImagesToDefault(): Promise<IVisit[]> {
    const result = await Visit.updateMany(
      {},
      {
        $set: {
          "visit.visitImage": "https://example.com/image.jpg",
          "visit.vehicleImage": "https://example.com/image.jpg",
        },
      }
    );
    if (result.modifiedCount === 0) return [];

    return this.getAllLatestVisitsGroupedByDocument();
  }

  static async updateVisitStatus(
    visitId: Types.ObjectId | string,
    newState: VisitState
  ): Promise<IVisit | null> {
    if (!Object.values(VisitState).includes(newState as VisitState))
      throw new Error(
        "El estado no es válido. Estados válidos: (pendiente, aprobada, rechazada, finalizada, expirada)"
      );

    return await Visit.findByIdAndUpdate(
      visitId,
      {
        $set: {
          "authorization.state": newState,
        },
      },
      { new: true }
    ).populate("authorization.resident", "name apartment");
  }

  static async getVisitsByResident(
    residentId: string | Types.ObjectId
  ): Promise<IVisit[]> {
    return await Visit.find({ "authorization.resident": residentId })
      .sort({ "authorization.date": -1 })
      .populate("authorization.resident", "name apartment");
  }

  static async getVisitsByGuard(
    guardId: string | Types.ObjectId
  ): Promise<IVisit[]> {
    return await Visit.find({
      $or: [
        { "registry.entry.guard": guardId },
        { "registry.exit.guard": guardId },
      ],
    })
      .sort({
        "registry.entry.date": -1,
        "registry.exit.date": -1,
      })
      .populate("authorization.resident", "name apartment")
      .populate("registry.entry.guard", "name")
      .populate("registry.exit.guard", "name");
  }

  static async deleteVisit(visitId: string | Types.ObjectId): Promise<void> {
    await Visit.findByIdAndDelete(visitId);
  }

  static async getAllVisits(): Promise<IVisit[]> {
    return await Visit.find()
      .populate("authorization.resident", "name apartment")
      .populate("registry.entry.guard", "name")
      .populate("registry.exit.guard", "name")
      .sort({ "authorization.date": -1 });
  }

  static async getVisitById(
    visitId: string | Types.ObjectId
  ): Promise<IVisit | null> {
    return await Visit.findById(visitId)
      .populate("authorization.resident", "name apartment")
      .populate("registry.entry.guard", "name")
      .populate("registry.exit.guard", "name");
  }

  static async getVisitByQR(qrId: string): Promise<IVisit | null> {
    return await Visit.findOne({ qrId })
      .populate("authorization.resident", "name apartment")
      .populate("registry.entry.guard", "name")
      .populate("registry.exit.guard", "name");
  }

  static async getVisitsByDocument(document: string): Promise<IVisit[]> {
    return await Visit.find({ "visit.document": document })
      .populate("authorization.resident", "name apartment")
      .populate("registry.entry.guard", "name")
      .populate("registry.exit.guard", "name");
  }

  static async getLatestVisitByDocument(
    document: string
  ): Promise<IVisit | null> {
    return await Visit.findOne({ "visit.document": document })
      .sort({ "authorization.date": -1 })
      .populate("authorization.resident", "name apartment")
      .populate("registry.entry.guard", "name")
      .populate("registry.exit.guard", "name");
  }

  static async getAllLatestVisitsGroupedByDocument(): Promise<IVisit[]> {
    const latestVisits = await Visit.aggregate([
      {
        $sort: { "authorization.date": -1 }, // Ordenamos por fecha descendente
      },
      {
        $group: {
          _id: "$visit.document", // Agrupamos por documento
          docId: { $first: "$_id" }, // Obtenemos el ID del documento más reciente
          visit: { $first: "$visit" }, // Obtenemos los datos de visita
          authorization: { $first: "$authorization" }, // Obtenemos los datos de autorización
          registry: { $first: "$registry" }, // Obtenemos los datos de registro
          qrId: { $first: "$qrId" }, // Obtenemos el QR ID
        },
      },
      {
        $project: {
          _id: "$docId", // Mantenemos el ID original
          visit: 1,
          authorization: 1,
          registry: 1,
          qrId: 1,
        },
      },
    ]);

    // Si no hay visitas, retornamos array vacío
    if (latestVisits.length === 0) return [];

    // Obtenemos los IDs de las visitas únicas
    const visitIds = latestVisits.map((v) => v._id);

    // Buscamos las visitas completas con los populate necesarios
    const populatedVisits = await Visit.find({ _id: { $in: visitIds } })
      .populate("authorization.resident", "name apartment")
      .populate("registry.entry.guard", "name")
      .populate("registry.exit.guard", "name")
      .sort({ "authorization.date": -1 });

    return populatedVisits;
  }

  static async getVisitsByResidentGroupedByDocument(
    residentId: string
  ): Promise<IVisit[]> {
    const latestVisits = await Visit.aggregate([
      {
        $match: {
          "authorization.resident": new mongoose.Types.ObjectId(residentId),
        },
      },
      {
        $sort: { "authorization.date": -1 }, // Ordenamos por fecha descendente
      },
      {
        $group: {
          _id: "$visit.document", // Agrupamos por documento
          docId: { $first: "$_id" }, // Obtenemos el ID del documento más reciente
          visit: { $first: "$visit" }, // Obtenemos los datos de visita
          authorization: { $first: "$authorization" }, // Obtenemos los datos de autorización
          registry: { $first: "$registry" }, // Obtenemos los datos de registro
          qrId: { $first: "$qrId" }, // Obtenemos el QR ID
        },
      },
      {
        $project: {
          _id: "$docId", // Mantenemos el ID original
          visit: 1,
          authorization: 1,
          registry: 1,
          qrId: 1,
        },
      },
    ]);

    // Si no hay visitas, retornamos array vacío
    if (latestVisits.length === 0) return [];

    // Obtenemos los IDs de las visitas únicas
    const visitIds = latestVisits.map((v) => v._id);

    // Buscamos las visitas completas con los populate necesarios
    const populatedVisits = await Visit.find({ _id: { $in: visitIds } })
      .populate("authorization.resident", "name apartment")
      .populate("registry.entry.guard", "name")
      .populate("registry.exit.guard", "name")
      .sort({ "authorization.date": -1 });

    return populatedVisits;
  }

  static async expirePendingVisits(): Promise<number> {
    const result = await Visit.updateMany(
      {
        "authorization.state": VisitState.PENDING,
        "authorization.exp": { $lt: new Date() },
      },
      {
        "authorization.state": VisitState.EXPIRED,
      }
    );
    return result.modifiedCount;
  }

  private static generateQRId(): string {
    return `qr-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
  }
}
