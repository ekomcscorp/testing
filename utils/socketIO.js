let io;

module.exports = {
  setIO: (ioInstance) => {
    io = ioInstance;
  },
  getIO: () => {
    if (!io) throw new Error("Socket.IO belum diinisialisasi.");
    return io;
  }
};
