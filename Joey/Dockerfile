FROM node
WORKDIR /app
COPY package.json .
RUN npm i

COPY requirements.txt .
RUN apt update
RUN apt -y install pip
RUN pip install --break-system-packages -r requirements.txt

RUN apt-get update
RUN apt-get install -y nano

COPY . .
EXPOSE 5174
EXPOSE 5001

CMD ["npm", "run", "dev"]