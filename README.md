Collect weather data from Dark Sky API and save to an Influx DB. Scrape pictures from Department of Roads of the state of São Paulo/Brazil Webcam`s and save locally.

    $ npm install

Run every xx minutes

    $ INFLUX_DB_HOST=<influxdbhost> DARKSKY_API_KEY=<apikey> CRON_SCHEDULE=<xxminutes> node index.js