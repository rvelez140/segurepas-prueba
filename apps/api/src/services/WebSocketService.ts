import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedClients: Map<string, Socket> = new Map();

  /**
   * Inicializar WebSocket server
   */
  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          process.env.WEB_URL || 'http://localhost:3000',
          process.env.MOBILE_URL || 'http://localhost:19000',
        ],
        credentials: true,
      },
    });

    // Middleware de autenticación
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('No autorizado - Token requerido'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        (socket as any).user = decoded;
        next();
      } catch (error) {
        next(new Error('No autorizado - Token inválido'));
      }
    });

    // Manejar conexiones
    this.io.on('connection', (socket) => {
      const user = (socket as any).user;
      console.log(`Cliente conectado: ${user.email} (${user.role})`);

      // Guardar referencia al socket
      this.connectedClients.set(user.id, socket);

      // Unirse a sala según rol
      socket.join(`role:${user.role}`);
      if (user.role === 'residente') {
        socket.join(`resident:${user.id}`);
      } else if (user.role === 'guardia') {
        socket.join('guards');
      }

      // Manejar desconexión
      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${user.email}`);
        this.connectedClients.delete(user.id);
      });

      // Eventos personalizados
      this.setupEventHandlers(socket);
    });

    console.log('✓ WebSocket servidor iniciado');
  }

  /**
   * Configurar manejadores de eventos
   */
  private setupEventHandlers(socket: Socket) {
    const user = (socket as any).user;

    // Ping/Pong para keep-alive
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Actualizar ubicación (para tracking)
    socket.on('update_location', (data) => {
      if (user.role === 'guardia') {
        this.io?.to('role:admin').emit('guard_location_updated', {
          guardId: user.id,
          location: data,
        });
      }
    });

    // Solicitar actualizaciones
    socket.on('request_updates', () => {
      // Enviar datos actualizados al cliente
      this.sendUpdates(socket, user);
    });
  }

  /**
   * Enviar actualizaciones al cliente
   */
  private async sendUpdates(socket: Socket, user: any) {
    // Implementar según necesidad
    // Por ejemplo, enviar visitas pendientes, etc.
  }

  // === EMISORES DE EVENTOS ===

  /**
   * Notificar nueva visita a guardias
   */
  emitNewVisit(visit: any) {
    this.io?.to('guards').emit('new_visit', visit);
    this.io?.to('role:admin').emit('new_visit', visit);
  }

  /**
   * Notificar al residente que su visitante llegó
   */
  emitVisitorArrived(residentId: string, visit: any) {
    this.io?.to(`resident:${residentId}`).emit('visitor_arrived', visit);
  }

  /**
   * Notificar entrada registrada
   */
  emitVisitEntry(visit: any) {
    this.io?.to(`resident:${visit.authorization.resident}`).emit('visit_entry', visit);
    this.io?.to('role:admin').emit('visit_entry', visit);
  }

  /**
   * Notificar salida registrada
   */
  emitVisitExit(visit: any) {
    this.io?.to(`resident:${visit.authorization.resident}`).emit('visit_exit', visit);
    this.io?.to('role:admin').emit('visit_exit', visit);
  }

  /**
   * Notificar cambio en espacios de parqueo
   */
  emitParkingUpdate(data: { type: string; space: any; assignment?: any }) {
    this.io?.emit('parking_update', data);
  }

  /**
   * Notificar espacio de parqueo asignado
   */
  emitParkingAssigned(visitId: string, assignment: any) {
    this.io?.emit('parking_assigned', { visitId, assignment });
  }

  /**
   * Notificar parqueadero lleno
   */
  emitParkingFull() {
    this.io?.to('guards').emit('parking_full');
  }

  /**
   * Notificar documento en lista negra
   */
  emitBlacklistAlert(document: string, details: any) {
    this.io?.to('guards').emit('blacklist_alert', { document, details });
    this.io?.to('role:admin').emit('blacklist_alert', { document, details });
  }

  /**
   * Broadcast a todos los clientes
   */
  broadcast(event: string, data: any) {
    this.io?.emit(event, data);
  }

  /**
   * Enviar a un rol específico
   */
  emitToRole(role: string, event: string, data: any) {
    this.io?.to(`role:${role}`).emit(event, data);
  }

  /**
   * Enviar a un usuario específico
   */
  emitToUser(userId: string, event: string, data: any) {
    const socket = this.connectedClients.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  /**
   * Obtener clientes conectados por rol
   */
  getConnectedByRole(role: string): number {
    if (!this.io) return 0;
    return this.io.sockets.adapter.rooms.get(`role:${role}`)?.size || 0;
  }

  /**
   * Obtener total de clientes conectados
   */
  getTotalConnected(): number {
    return this.connectedClients.size;
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return {
      total: this.getTotalConnected(),
      guardias: this.getConnectedByRole('guardia'),
      residentes: this.getConnectedByRole('residente'),
      admins: this.getConnectedByRole('admin'),
    };
  }
}

// Exportar instancia singleton
export const webSocketService = new WebSocketService();
