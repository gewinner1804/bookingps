// === backend/routes/booking.js ===
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /booking
router.post('/', async (req, res) => {
  const { nama, tipe, jam, tanggal, pembayaran, bukti } = req.body;
  const jamList = Array.isArray(jam) ? jam : [jam];
  const maxPS = tipe === 'PlayStation 4' ? 10 : 5;

  for (let j of jamList) {
    const count = await Booking.countDocuments({ tipe, tanggal, jam: j });
    if (count >= maxPS) {
      return res.status(409).json({ message: `PS ${tipe} jam ${j}:00 sudah penuh` });
    }
  }

  const bookings = jamList.map(j => ({
    nama,
    tipe,
    jam: j,
    tanggal,
    pembayaran,
    bukti
  }));
  await Booking.insertMany(bookings);
  res.json({ message: 'Booking berhasil' });
});

// GET /booking/all
router.get('/all', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ tanggal: -1, jam: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data booking' });
  }
});

module.exports = router;

