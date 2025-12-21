FROM alpine
RUN apk add --update nodejs npm
COPY package*.json /app/
WORKDIR /app
RUN npm install
COPY . /app
EXPOSE 3000
ENTRYPOINT ["node", "src/app.js"]
