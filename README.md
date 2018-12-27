Collect weather data from Dark Sky API and save to an Influx DB. Scrape pictures from Department of Roads of the state of São Paulo/Brazil Webcam`s and save locally.

---> Run every xx minutes using docker-compose:
 
a) clone the project directory in github
    $ git clone https://github.com/lucianojacobina/darksky-webcam.git

 b) edit the docker-compose.yml file. Change the environment variables of the container "backend_darksky_der":
- the darksky-api key (DARKSKY_API_KEY) that can be obtained from the site https://darksky.net/dev/login;
- data search interval(CRON_SCHEDULE) in minutes. Twenty minutes in the example below;
environment:    
- INFLUX_DB_HOST=influxdb_moto:8086
- DARKSKY_API_KEY=99999999999999999999999999999999 
- CRON_SCHEDULE=20

c) install docker

d) run the docker-compose up in the directory where the project was cloned
