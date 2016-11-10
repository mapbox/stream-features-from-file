'use strict';

const mapnik = require('mapnik');
const stream = require('stream');
const filesniffer = require('mapbox-file-sniff');

// Register datasource plugins
mapnik.register_default_input_plugins();

const getFileType = (filePath) => {
  return new Promise((resolve, reject) => {
    filesniffer.quaff(filePath, false, (err, fileType) => {
      if (err) return reject(err);
      resolve(fileType);
    });
  });
};

const streamFeaturesFromFile = (filePath) => {
  const featureStream = new stream.Readable({ read: () => {} });
  featureStream.setEncoding('utf8');

  getFileType(filePath)
    .then((fileType) => {
      const datasourceOptions = { file: filePath };
      switch (fileType) {
        case 'geojson':
          datasourceOptions.type = 'geojson';
          datasourceOptions.cache_features = false;
          break;
        case 'shp':
          datasourceOptions.type = 'shape';
          break;
        case 'csv':
          datasourceOptions.type = 'csv';
          break;
        default:
          throw new Error(`Unrecognized type "${fileType}" for file "${filePath}"`);
      }

      const datasource = new mapnik.Datasource(datasourceOptions);
      const features = datasource.featureset();
      if (features) {
        let feature = features.next();
        while (feature) {
          featureStream.push(feature.toJSON());
          feature = features.next();
        }
      }
      featureStream.push(null);
    })
    .catch((err) => featureStream.emit('error', err));

  return featureStream;
};

module.exports = streamFeaturesFromFile;
