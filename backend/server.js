const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

mongoose.connect('mongodb://127.0.0.1:27017/psrental', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const bookingSchema = new mongoose.Schema({
  nama: String,
  tipe: String,
  tanggal: String,
  jam: Number,
  durasi: Number,
  total: Number,
  bukti: String,
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

app.post('/booking', async (req, res) => {
  try {
    const { nama, tipe, tanggal, jam, durasi, total, bukti } = req.body;

    const maxPS = { PS4: 10, PS5: 5 };

    // Cek booking yang bentrok
    const bookings = await Booking.find({
      tipe, tanggal,
      $or: [
        { jam: { $lte: jam }, $expr: { $gt: [{ $add: ["$jam", "$durasi"] }, jam] } },
        { jam: { $gte: jam, $lt: jam + durasi } },
      ]
    });

    if (bookings.length >= maxPS[tipe]) {
      return res.status(400).json({ error: `Maaf, PS ${tipe} pada jam tersebut sudah penuh.` });
    }

    const newBooking = new Booking({ nama, tipe, tanggal, jam, durasi, total, bukti });
    await newBooking.save();
    res.json({ message: 'Booking berhasil dibuat' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.get('/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ tanggal: 1, jam: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data booking' });
  }
});

app.delete('/admin/booking/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus booking' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
