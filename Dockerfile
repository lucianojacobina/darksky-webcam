FROM node:7

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

RUN apt-get update && apt-get install -yq libgconf-2-4
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb
RUN npm i puppeteer

ENV INFLUX_DB_HOST localhost:8086/
ENV DARKSKY_API_KEY 44ae091396a4b43aa01a73b566ea6182
ENV CRON_SCHEDULE 01
CMD node index.js $INFLUX_DB_HOST $DARKSKY_API_KEY $CRON_SCHEDULE