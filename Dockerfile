# Gunakan node image yang sudah diatur
FROM node:14

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json untuk menginstal dependencies
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy seluruh aplikasi
COPY . .

# Expose port 3000 untuk aplikasi Express
EXPOSE 3000

# Command untuk menjalankan aplikasi ketika container dijalankan
CMD ["npm", "start"]
