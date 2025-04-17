const db = require('../config/db');

// Fungsi generate NIP aman
function generateNIP(callback) {
    const year = new Date().getFullYear();
    const likePattern = `${year}%`;
    const query = 'SELECT nip FROM karyawan WHERE nip LIKE ? ORDER BY nip DESC LIMIT 1';

    db.query(query, [likePattern], (err, results) => {
        if (err) return callback(err);

        let counter = 1;

        if (results.length > 0) {
            const lastNip = results[0].nip;
            const lastCounter = parseInt(lastNip.substr(4, 4)); // ambil xxxx dari YYYYxxxx
            counter = lastCounter + 1;
        }

        const newNIP = `${year}${String(counter).padStart(4, '0')}`;
        callback(null, newNIP);
    });
}

exports.createKaryawan = (req, res) => {
    const { id, nama, alamat, gend, photo, tgl_lahir, status } = req.body;
    const insert_by = req.user.data;  // dari token
    const insert_at = new Date();

    // Validasi field wajib
    if (!nama || !alamat || !gend || !photo || !tgl_lahir || !status) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Validasi karakter tidak diizinkan dalam nama
    const specialCharPattern = /[<>$%#@!]/;
    if (specialCharPattern.test(nama)) {
        return res.status(400).json({ message: 'Nama mengandung karakter tidak diizinkan' });
    }

    // Validasi gender hanya L atau P
    if (gend !== 'L' && gend !== 'P') {
        return res.status(400).json({ message: 'Gend hanya boleh L atau P' });
    }

    generateNIP((err, nip) => {
        if (err) {
            console.error('Error generate NIP:', err);
            return res.status(500).json({ message: 'Gagal generate NIP' });
        }

        const useId = id !== undefined ? id : null;

        if (useId !== null) {
            // kalau id ada di body, langsung insert pakai itu
            const insertQuery = `
              INSERT INTO karyawan 
              (id, nip, nama, alamat, gend, photo, tgl_lahir, status, insert_at, insert_by) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertQuery,
                [useId, nip, nama, alamat, gend, photo, tgl_lahir, status, insert_at, insert_by],
                (insertErr) => {
                    if (insertErr) {
                        console.error('Error insert karyawan:', insertErr);
                        return res.status(500).json({ message: 'Gagal menyimpan data karyawan' });
                    }

                    res.json({
                        message: 'Karyawan berhasil didaftarkan',
                        nip: nip
                    });
                }
            );
        } else {
            // kalau nggak ada id di body, baru getNextId
            getNextId((err, nextId) => {
                if (err) {
                    console.error('Error get next ID:', err);
                    return res.status(500).json({ message: 'Gagal generate ID' });
                }

                const insertQuery = `
                INSERT INTO karyawan 
                (id, nip, nama, alamat, gend, photo, tgl_lahir, status, insert_at, insert_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

                db.query(
                    insertQuery,
                    [nextId, nip, nama, alamat, gend, photo, tgl_lahir, status, insert_at, insert_by],
                    (insertErr) => {
                        if (insertErr) {
                            console.error('Error insert karyawan:', insertErr);
                            return res.status(500).json({ message: 'Gagal menyimpan data karyawan' });
                        }

                        res.json({
                            message: 'Karyawan berhasil didaftarkan',
                            nip: nip
                        });
                    }
                );
            });
        }
    });
}

exports.getKaryawanList = (req, res) => {
    const { keyword = '', start = 0, count = 10 } = req.query;
  
    // Validasi start & count harus angka
    if (isNaN(start) || isNaN(count)) {
      return res.status(400).json({ message: 'Parameter start dan count harus berupa angka' });
    }
  
    // Validasi karakter khusus di keyword
    const specialCharPattern = /[<>$%#@!]/;
    if (specialCharPattern.test(keyword)) {
      return res.status(400).json({ message: 'Keyword mengandung karakter tidak diizinkan' });
    }
  
    // Query ambil data karyawan + filtering keyword + pagination
    const query = `
      SELECT id, nip, nama, alamat, gend, photo, tgl_lahir, status, insert_at, insert_by, update_at, update_by 
      FROM karyawan 
      WHERE nama LIKE ? 
      LIMIT ?, ?
    `;
  
    const keywordPattern = `%${keyword}%`;
  
    db.query(query, [keywordPattern, parseInt(start), parseInt(count)], (err, results) => {
      if (err) {
        console.error('Error ambil daftar karyawan:', err);
        return res.status(500).json({ message: 'Gagal mengambil data karyawan' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
      }
  
      res.json({
        message: 'Berhasil mendapatkan daftar karyawan',
        data: results
      });
    });
  };

  exports.updateKaryawan = (req, res) => {
    const { nip } = req.params;
    const { nama, alamat, gend, photo, tgl_lahir, status } = req.body;
    const update_by = req.user.data;
    const update_at = new Date();
  
    // Validasi field wajib
    if (!nama || !alamat || !gend || !photo || !tgl_lahir || !status) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
  
    // Validasi karakter nama
    const specialCharPattern = /[<>$%#@!]/;
    if (specialCharPattern.test(nama)) {
      return res.status(400).json({ message: 'Nama mengandung karakter tidak diizinkan' });
    }
  
    // Validasi gender
    if (gend !== 'L' && gend !== 'P') {
      return res.status(400).json({ message: 'Gend hanya boleh L atau P' });
    }
  
    // Cek apakah NIP ada
    const checkQuery = 'SELECT * FROM karyawan WHERE nip = ?';
    db.query(checkQuery, [nip], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error cek NIP:', checkErr);
        return res.status(500).json({ message: 'Gagal cek data karyawan' });
      }
  
      if (checkResults.length === 0) {
        return res.status(404).json({ message: 'Data karyawan tidak ditemukan' });
      }
  
      // Query update
      const updateQuery = `
        UPDATE karyawan 
        SET nama = ?, alamat = ?, gend = ?, photo = ?, tgl_lahir = ?, status = ?, update_at = ?, update_by = ?
        WHERE nip = ?
      `;
  
      db.query(
        updateQuery,
        [nama, alamat, gend, photo, tgl_lahir, status, update_at, update_by, nip],
        (updateErr, result) => {
          if (updateErr) {
            console.error('Error update karyawan:', updateErr);
            return res.status(500).json({ message: 'Gagal menyimpan data karyawan' });
          }
  
          res.json({ message: 'Data karyawan berhasil diperbarui' });
        }
      );
    });
  };  

  exports.nonaktifkanKaryawan = (req, res) => {
    const { nip } = req.params;
    const update_by = req.user.data;
    const update_at = new Date();
  
    // Validasi NIP tidak boleh kosong
    if (!nip) {
      return res.status(400).json({ message: 'NIP wajib diisi' });
    }
  
    // Cek special character di NIP
    const specialCharPattern = /[<>$%#@!]/;
    if (specialCharPattern.test(nip)) {
      return res.status(400).json({ message: 'NIP mengandung karakter tidak diizinkan' });
    }
  
    const updateQuery = `
      UPDATE karyawan 
      SET status = 9, update_at = ?, update_by = ?
      WHERE nip = ?
    `;
  
    db.query(updateQuery, [update_at, update_by, nip], (err, result) => {
      if (err) {
        console.error('Error nonaktifkan karyawan:', err);
        return res.status(500).json({ message: 'Gagal menonaktifkan karyawan' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
      }
  
      res.json({ message: 'Karyawan berhasil dinonaktifkan' });
    });
  };
  