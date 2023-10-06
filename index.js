const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const makeWASocket = require('@whiskeysockets/baileys').default;
async function connectionLogic() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
      // Tambahkan konfigurasi tambahan di sini
      printQRInTerminal: true,
      auth: state,
    });
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update || {};
      if (qr) {
        console.log(qr);
      }
      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          // Tambahkan penundaan sebelum mencoba koneksi ulang
          setTimeout(connectionLogic, 5000); // Tunggu 5 detik sebelum mencoba kembali
        }
      } else if (connection === 'open') {
        console.log('Koneksi berhasil dibuka');
      }
    });
    sock.ev.on('messages.update', (messageInfo) => {
        console.log('Pesan Baru (Update):');
        console.log(messageInfo);
      });
      sock.ev.on('messages.upsert', (messageInfoUpsert) => {
        console.log('Pesan Baru (Upsert):');
        console.log(messageInfoUpsert);
        const incomingMessage = messageInfoUpsert.messages[0].message;

        console.log('Pesan Masuk:', incomingMessage);
      });
      
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
}

// Jalankan fungsi koneksi
connectionLogic();