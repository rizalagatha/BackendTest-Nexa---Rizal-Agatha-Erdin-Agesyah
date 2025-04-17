# Menggunakan Node.js dari Alpine sebagai base image
FROM node:16-alpine

# Tentukan working directory di dalam container
WORKDIR /usr/src/app

# Salin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh source code ke dalam container
COPY . .

# Expose port 3000 (port yang digunakan oleh aplikasi)
EXPOSE 3000

# Jalankan perintah untuk memulai aplikasi
CMD ["npm", "start"]
