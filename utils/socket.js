module.exports = (io, sessionMiddleware) => {
  // Pasang session middleware ke socket
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', (socket) => {
    const req = socket.request;

    console.log("🟢 Socket connected");

    socket.on('init_user', () => {
      const user = req.session?.user;

      if (!user) {
        console.log("❌ Tidak ada user di session");
        return;
      }


      if (user.id_level === 1) {
        socket.join('super admin');
        console.log(`👑 ${user.username} masuk ke room super admin`);
        socket.emit('joined_admin_room'); // ⬅️ ini penting!
      } else {
        console.log(`👤 ${user.username} masuk dan tidak memiliki akses admin`);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });
  });
};
