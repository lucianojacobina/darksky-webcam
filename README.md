Collect weather data from Dark Sky API and save to an Influx DB. Scrape pictures from Department of Roads of the state of São Paulo/Brazil Webcam`s and save locally.

---> Run every xx minutes using docker-compose:
 
a) Clone the project:
$ git clone https://github.com/lucianojacobina/darksky-webcam.git

b) Edit the docker-compose.yml file. Change the environment variables of the container "backend_darksky_der":
- the darksky-api key (DARKSKY_API_KEY) that can be obtained from the site https://darksky.net/dev/login;
- data search interval(CRON_SCHEDULE) in minutes. Twenty minutes in the example below;
- the full public facing url to access Grafana dashboard (GF_SERVER_ROOT_URL)
- environment:    
  - INFLUX_DB_HOST=influxdb_moto:8086
  - DARKSKY_API_KEY=99999999999999999999999999999999 
  - CRON_SCHEDULE=20
  - GF_SERVER_ROOT_URL=http://grafanaservername:3000

c) Install docker

d) Run the docker-compose up in the directory where the project was cloned
