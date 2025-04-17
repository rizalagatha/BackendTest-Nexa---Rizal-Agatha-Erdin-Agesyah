# BackendTest Nexa - Rizal Agatha Erdin Agesyah

## Prerequisites

- Docker
- Docker Compose (opsional)

## Menjalankan dengan Docker

1. Clone repository ini.
2. Jalankan perintah berikut untuk membangun image Docker:

    ```bash
    docker build -t backend-nexa .
    ```

3. Jalankan container Docker:

    ```bash
    docker run -p 3000:3000 backend-nexa
    ```

Jika Anda menggunakan Docker Compose:

1. Jalankan perintah berikut untuk membangun dan menjalankan semua service:

    ```bash
    docker-compose up --build
    ```

Aplikasi akan tersedia di `http://localhost:3000`.

## Konfigurasi Lain

Pastikan Anda sudah mengonfigurasi file environment seperti `.env` untuk aplikasi Anda jika diperlukan.
