'use strict';

const mapnik = require('mapnik');

mapnik.register_default_input_plugins();

/**
 * Pushes GeoJSON features from a file into a readable stream.
 * Uses Mapnik to read the file and parse features.
 *
 * @param {ReadableStream} featureStream
 * @param {string} filePath
 * @param {string} fileType
 */
const streamFromMapnik = (featureStream, filePath, fileType) => {
  const datasourceOptions = { file: filePath };
  switch (fileType) {
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
      const parsedFeature = JSON.parse(feature.toJSON());
      delete parsedFeature.id; // Mapnik added this
      featureStream.push(parsedFeature);
      feature = features.next();
    }
  }
  featureStream.push(null);
};

module.exports = streamFromMapnik;
