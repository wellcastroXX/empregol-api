import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../shared/utils/jwt.util';
import { MessageService } from '../modules/message/message.service';
import { ConversationRepository } from '../modules/conversation/conversation.repository';

interface AuthSocket extends Socket {
  userId: string;
  userRole: string;
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN ?? '*', credentials: true },
    pingTimeout: 60000,
  });

  // ─── JWT auth middleware ──────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Token não fornecido'));
    try {
      const payload = verifyAccessToken(token);
      (socket as AuthSocket).userId = payload.sub;
      (socket as AuthSocket).userRole = payload.role;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  const messageService = new MessageService();
  const convRepo = new ConversationRepository();

  io.on('connection', (socket: Socket) => {
    const { userId, userRole } = socket as AuthSocket;

    // ─── Join conversation room ─────────────────────────────────────────────
    socket.on('conversation:join', async (conversationId: string) => {
      const conv = await convRepo.findById(conversationId);
      if (!conv) return socket.emit('error', { message: 'Conversa não encontrada' });

      const isAthlete = userRole === 'ATHLETE' && conv.athlete.userId === userId;
      const isContractor = (userRole === 'AGENT' || userRole === 'CLUB') && conv.contractor.userId === userId;

      if (!isAthlete && !isContractor) {
        return socket.emit('error', { message: 'Acesso negado' });
      }

      socket.join(`conv:${conversationId}`);
      socket.emit('conversation:joined', { conversationId });
    });

    // ─── Send message ───────────────────────────────────────────────────────
    socket.on('message:send', async (data: { conversationId: string; type: string; content?: string; audioUrl?: string; proposalId?: string }) => {
      try {
        const dto = data as any;
        const result = await messageService.send(userId, userRole as any, data.conversationId, dto);
        io.to(`conv:${data.conversationId}`).emit('message:new', result.message);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Typing indicators ──────────────────────────────────────────────────
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', { userId, conversationId });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', { userId, conversationId });
    });

    // ─── Mark as read ───────────────────────────────────────────────────────
    socket.on('message:read', async (conversationId: string) => {
      try {
        await convRepo.markRead(conversationId, userRole === 'ATHLETE' ? 'ATHLETE' : 'CONTRACTOR');
        socket.to(`conv:${conversationId}`).emit('message:read', { conversationId, readBy: userId });
      } catch {
        // silent
      }
    });

    socket.on('disconnect', () => {
      // rooms are auto-cleaned by socket.io
    });
  });

  return io;
}
