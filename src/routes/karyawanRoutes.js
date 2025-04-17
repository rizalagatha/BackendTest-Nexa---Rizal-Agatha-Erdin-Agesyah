const express = require('express');
const router = express.Router();
const karyawanController = require('../controllers/karyawanController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, karyawanController.createKaryawan);
router.get('/list', authenticateToken, karyawanController.getKaryawanList);
router.put('/update/:nip', authenticateToken, karyawanController.updateKaryawan);
router.put('/nonaktif/:nip', authenticateToken, karyawanController.nonaktifkanKaryawan);

module.exports = router;
