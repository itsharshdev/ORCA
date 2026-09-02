import pfzData from '../../data/demo/pfz.json';
import weatherData from '../../data/demo/weather.json';
import oceanData from '../../data/demo/ocean.json';
import hazardsData from '../../data/demo/hazards.json';
import boundariesRaw from '../../data/demo/boundaries.geojson?raw';
import vesselsData from '../../data/demo/vessels.json';

const boundariesData = JSON.parse(boundariesRaw);

export {
  pfzData,
  weatherData,
  oceanData,
  hazardsData,
  boundariesData,
  vesselsData,
};
