const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  nama: String,
  tipe: String,
  jam: Number,
  tanggal: String,
  pembayaran: String,
  bukti: String
});
module.exports = mongoose.model('Booking', BookingSchema);
