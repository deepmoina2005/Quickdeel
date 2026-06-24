let ioInstance;

export const setSocket = (io) => {
  ioInstance = io;
};

export const getSocket = () => ioInstance;

export const emitToUser = (userId, event, payload) => {
  if (ioInstance) ioInstance.to(`user:${userId}`).emit(event, payload);
};
