import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { setSocket } from "./services/socket.service.js";
import { verifyAccessToken } from "./services/token.service.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientUrl, credentials: true },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return next(new Error("Unauthorized"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.user.id}`);
  socket.on("conversation:join", (conversationId) =>
    socket.join(`conversation:${conversationId}`),
  );
  socket.on("disconnect", () => {});
});

setSocket(io);

server.listen(env.port, () => {
  console.log(`QuickDeal API running on port ${env.port}`);
});
