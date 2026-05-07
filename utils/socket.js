const { verifyToken } = require("./jwt");

module.exports = (io) => {

  io.on('connection', (socket) => {
    const req = socket.request;

    console.log("🟢 Socket connected");

    socket.on('init_user', (token) => {
      if (!token) {
        console.log("❌ Tidak ada token untuk socket");
        return;
      }

      try {
        const user = verifyToken(token);


      if (user.id_level === 1) {
        socket.join('super admin');
        console.log(`👑 ${user.username} masuk ke room super admin`);
        socket.emit('joined_admin_room'); // ⬅️ ini penting!
      } else {
        console.log(`👤 ${user.username} masuk dan tidak memiliki akses admin`);
      }
      } catch (err) {
        console.log("❌ Token JWT socket tidak valid", err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });
  });
};
