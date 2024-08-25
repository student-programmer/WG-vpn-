FROM docker.io/library/node:18-alpine AS build_node_modules

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
