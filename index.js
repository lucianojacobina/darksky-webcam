// sudo docker start a2df4debeefd
// sudo docker exec -it elegant_khorana influx
// sudo INFLUX_DB_HOST=localhost:8086/ DARKSKY_API_KEY=44ae091396a4b43aa01a73b566ea6182 node index.js

// https://codeburst.io/a-guide-to-automating-scraping-the-web-with-javascript-chrome-puppeteer-node-js-b18efb9e9921
// https://pptr.dev/
// http://www.der.sp.gov.br/WebSite/Servicos/ServicosOnline/CamerasOnline.aspx
// http://www.rodoviasonline.com.br/rodovia-sp-125-oswaldo-cruz/
// https://www.npmjs.com/package/jimp
// https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md
// https://docker-curriculum.com/#docker-compose
// https://docs.docker.com/compose/compose-file/
// http://rogerdudler.github.io/git-guide/index.pt_BR.html
// https://git-scm.com/book/pt-br/v1/Primeiros-passos-Configura%C3%A7%C3%A3o-Inicial-do-Git

const Influx = require('influx');
const DarkSky = require('dark-sky');
const Cron = require('node-cron');
const puppeteer = require('puppeteer');


const INFLUX_DB_HOST = process.env.INFLUX_DB_HOST || "influxdb.rydbir.local";
const DARKSKY_API_KEY = process.env.DARKSKY_API_KEY;
const CRON_SCHEDULE = process.env.CRON_SCHEDULE;
const CONFIG_FILE = process.env.CONFIG_FILE || './config.json';
const USE_CRON = true;
const CONFIG = require(CONFIG_FILE);
const darkskyApi = new DarkSky(DARKSKY_API_KEY);
const cronschedule = CRON_SCHEDULE;

// Main
console.log("*1.0. Main- setar variáveis influxDb**");
const forecastDb = new Influx.InfluxDB({
  host: INFLUX_DB_HOST,
  database: 'forecast',
  username: 'admin',
  password: 'admin',
  schema: [
    {
      measurement: 'hourly',
      fields: {
        latitude: Influx.FieldType.FLOAT,
        longitude: Influx.FieldType.FLOAT,
        summary: Influx.FieldType.STRING,
        temperature: Influx.FieldType.FLOAT,
        dewPoint: Influx.FieldType.FLOAT,
        humidity: Influx.FieldType.FLOAT,
        pressure: Influx.FieldType.FLOAT,
        windSpeed: Influx.FieldType.FLOAT,
        windBearing: Influx.FieldType.INTEGER,
        cloudCover: Influx.FieldType.FLOAT,
        icon: Influx.FieldType.STRING,
      },
      tags: [
        'location', 'estacao'
      ]
    },
    {
      measurement: 'currently',
      fields: {
        latitude: Influx.FieldType.FLOAT,
        longitude: Influx.FieldType.FLOAT,
        summary: Influx.FieldType.STRING,
        icon: Influx.FieldType.STRING,
        nearestStormBearing: Influx.FieldType.INTEGER,
        nearestStormDistance: Influx.FieldType.INTEGER,
        precipIntensity: Influx.FieldType.FLOAT,
        precipIntensityError: Influx.FieldType.FLOAT,
        precipProbability: Influx.FieldType.FLOAT,
        precipType: Influx.FieldType.STRING,
        temperature: Influx.FieldType.FLOAT,
        dewPoint: Influx.FieldType.FLOAT,
        humidity: Influx.FieldType.FLOAT,
        pressure: Influx.FieldType.FLOAT,
        windSpeed: Influx.FieldType.FLOAT,
        windBearing: Influx.FieldType.INTEGER,
        cloudCover: Influx.FieldType.FLOAT,
      },
      tags: [
        'location', 'estacao'
      ]
    },
    {
      measurement: 'minutely',
      fields: {
        latitude: Influx.FieldType.FLOAT,
        longitude: Influx.FieldType.FLOAT,
        summary: Influx.FieldType.STRING,
        icon: Influx.FieldType.STRING,
        precipIntensity: Influx.FieldType.FLOAT,
        precipIntensityError: Influx.FieldType.FLOAT,
        precipProbability: Influx.FieldType.FLOAT,
        precipType: Influx.FieldType.STRING,
      },
      tags: [
        'location', 'estacao'
      ]
    },
  ]
});

console.log("*2.0. Main- levantar banco & loop por tempo **");
setupDb().then(() => {
  if (USE_CRON) {
    //At every 15th minute
    Cron.schedule('*/'+cronschedule+' * * * *', () => {     
      console.log("*2.0. Main- Loop por tempooooooooooooooooooooooooooooooooooooooooooooooooooooooooo **");
      collectForecastData()
      console.log("*0.2. Scrape - chamar função**");
      scrape().then(() => {
        console.log("0.3. Scrape Sucesso") 
      });
    });
  } else {
    collectForecastData()
    console.log("*0.4. Scrape - chamar função**");
    scrape().then(() => {
      console.log("0.5. Scrape Sucesso") 
    });
  }
})
  .catch(console.error);

// Functions
function setupDb() {
  return new Promise((resolve, reject) => {
    forecastDb.getDatabaseNames().then(names => {
      if (!names.find(n => n === 'forecast')) {
        forecastDb.createDatabase('forecast').then(resolve).catch(reject);
      }
      resolve();
    }).catch(reject);
  });
}

function collectForecastData() {
  console.log("*2.1. Functions- coletar dados *******");
  const darkskyRequests = [];
  CONFIG.locations.forEach(location => {
    console.log('*********************************************');
    console.log("*2.1.1 Para cada local- coletar dados *******");
    console.log("*latitude:" + location.latitude);
    console.log("*Nome:" + location.name);
    console.log('**********************************************');

    const p = new Promise((resolve, reject) => {
      darkskyApi.latitude(location.latitude).longitude(location.longitude)
        .units('si')
        .language('pt')
        .exclude('daily,alerts')
        .get()
        .then(data => {
          const hourly = data.hourly;
          const c = data.currently;
          let points = [];
          hourly.data.forEach(d => {
            points.push({
              measurement: 'hourly',
              fields: {
                latitude: location.latitude,
                longitude: location.longitude,
                summary: d.summary,
                temperature: d.temperature,
                dewPoint: d.dewPoint,
                humidity: d.humidity,
                pressure: d.pressure,
                windSpeed: d.windSpeed,
                windBearing: d.windBearing,
                cloudCover: d.cloudCover,
                icon: d.icon,
              },
              tags: { location: location.name, estacao: location.estacao },
              timestamp: d.timestamp,
            });
          });

          points.push({
            measurement: 'currently',
            fields: {
              latitude: location.latitude,
              longitude: location.longitude,
              summary: c.summary,
              icon: c.icon,
              nearestStormBearing: c.nearestStormBearing,
              nearestStormDistance: c.nearestStormDistance,
              precipIntensity: c.precipIntensity,
              precipIntensityError: c.precipIntensityError,
              precipProbability: c.precipProbability,
              precipType: c.precipType,
              temperature: c.temperature,
              dewPoint: c.dewPoint,
              humidity: c.humidity,
              pressure: c.pressure,
              windSpeed: c.windSpeed,
              windBearing: c.windBearing,
              cloudCover: c.cloudCover,
            },
            tags: { location: location.name, estacao: location.estacao },
            timestamp: c.timestamp,
          });

          hourly.data.forEach(e => {
            points.push({
              measurement: 'minutely',
              fields: {
                latitude: location.latitude,
                longitude: location.longitude,
                summary: e.summary,
                icon: e.icon,
                precipIntensity: e.precipIntensity,
                precipIntensityError: e.precipIntensityError,
                precipProbability: e.precipProbability,
                precipType: e.precipType,
              },
              tags: { location: location.name, estacao: location.estacao },
              timestamp: e.timestamp,
            });
          });

          forecastDb.writePoints(points)
            .then(() => {
              console.log('*********************************************');
              console.log("*2.1.2 Para cada local- GRAVAR DADOS *******");
              console.log("*latitude:" + location.latitude);
              console.log("*Nome:" + location.name);
              console.log("Timestamp:" + c.timestamp);
            //  console.log("timestampFiles:" + timestampFiles);
            //  timestampFiles = c.timestamp;
              console.log('**********************************************');
              resolve();
            })
            .catch(e => {
              reject(e.message);
            });
        })
        .catch(reject);
    });
    darkskyRequests.push(p);
  })
  Promise.all(darkskyRequests)
    .then(() => {
      console.log('****************************************** Processed ' + CONFIG.locations.length + ' location(s)');
    })
    .catch(console.error);
}

// Scrapping
console.log("*0.0. Scrape - antes da declaração scrape**")
let scrape = async () => {
  console.log("*0.1. Scrape - dentro da declaração scrape**");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage()
  const timestampFiles = new Date().getTime();
  await page.goto('http://www.der.sp.gov.br/Upload/Cameras/CamSP125Km4S1.jpg?1468888542207',{waitUntil: 'load'})
  await page.waitFor(1000)
  await page.screenshot({ path: 'DER-SP 125 - km 4_5-'+ timestampFiles +'.png' });
  await page.goto('http://www.der.sp.gov.br/Upload/Cameras/CamSP125km081S1.jpg?1468888542207',{waitUntil: 'load'})
  await page.waitFor(1000)
  await page.screenshot({ path: 'DER-SP 125 - km 81-'+ timestampFiles +'.png' });
  await page.goto('http://www.der.sp.gov.br/Upload/Cameras/CamSP125km94S1.jpg?1468888542207',{waitUntil: 'load'})
  await page.waitFor(1000)
  await page.screenshot({ path: 'DER-SP 125 - km 94-'+ timestampFiles +'.png' });

  browser.close()
};
