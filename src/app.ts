import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorMiddleware } from './shared/middleware/error.middleware';
import { uploadDir } from './shared/upload/upload';
import { authAthleteRouter } from './modules/auth/athlete/auth-athlete.router';
import { authContractorRouter } from './modules/auth/contractor/auth-contractor.router';
import { authSocialRouter } from './modules/auth/social/auth-social.router';
import { athleteRouter } from './modules/athlete/athlete.router';
import { publicAthleteRouter } from './modules/athlete/public-athlete.router';
import { contractorRouter } from './modules/contractor/contractor.router';
import { proposalRouter } from './modules/proposal/proposal.router';
import { dashboardRouter } from './modules/dashboard/dashboard.router';
import { seasonStatsRouter } from './modules/season-stats/season-stats.router';
import { athleteVideoRouter } from './modules/athlete-video/athlete-video.router';
import { conversationRouter } from './modules/conversation/conversation.router';
import { messageRouter } from './modules/message/message.router';
import { exploreRouter } from './modules/explore/explore.router';
import { favoriteRouter } from './modules/favorite/favorite.router';
import { notificationsRouter } from './modules/notifications/notifications.router';
import { accountRouter } from './modules/account/account.router';
import { moderationRouter } from './modules/moderation/moderation.router';

const app = express();

// Atrás do Traefik + Cloudflare tunnel: confia no proxy para ler o IP real
// (X-Forwarded-For) — corrige o rate-limit (por cliente, não por proxy) e o aviso.
app.set('trust proxy', 1);

// ─── Security ────────────────────────────────────────────────────────────────
// crossOriginResourcePolicy relaxado pra o app carregar /uploads de outra origem.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));

// ─── Static uploads (mídia + avatar; disco local enquanto não há S3) ───────────
app.use('/uploads', express.static(uploadDir));

// ─── Documentos públicos (termos de uso, etc.) — servidos inline p/ visualização ─
app.use('/legal', express.static(path.join(process.cwd(), 'public', 'legal')));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 2000, standardHeaders: true, legacyHeaders: false });

app.use(globalLimiter);
app.use('/auth', authLimiter);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.use('/auth/athletes',    authAthleteRouter);
app.use('/auth/contractors', authContractorRouter);
app.use('/auth/social',      authSocialRouter);

// ─── Público (sem token) ──────────────────────────────────────────────────────
// Vitrine que o atleta abriu por conta própria — empregol.co/p/<slug>.
app.use('/public',            publicAthleteRouter);

// ─── Profiles ─────────────────────────────────────────────────────────────────
app.use('/athletes',          athleteRouter);
app.use('/contractors',       contractorRouter);

// ─── Athlete sub-resources ────────────────────────────────────────────────────
app.use('/athletes/me/season-stats', seasonStatsRouter);
app.use('/athletes/me/media',        athleteVideoRouter);

// ─── Social / engagement ──────────────────────────────────────────────────────
app.use('/proposals',    proposalRouter);
app.use('/conversations', conversationRouter);
app.use('/explore',      exploreRouter);
app.use('/favorites',    favoriteRouter);

// Nested messages under conversations
app.use('/conversations/:id/messages', messageRouter);

// ─── Dashboard ────────────────────────────────────────────────────────────────
app.use('/dashboard', dashboardRouter);

// ─── Notificações (push) ──────────────────────────────────────────────────────
app.use('/notifications', notificationsRouter);

// ─── Conta & moderação (exclusão de conta, denúncias, bloqueios) ────────────────
app.use('/account', accountRouter);
app.use('/moderation', moderationRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Rota não encontrada' }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

export { app };
