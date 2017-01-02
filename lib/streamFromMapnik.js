'use strict';

const mapnik = require('mapnik');
const invalid = require('./invalid');

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
  const handleError = (err) => {
    featureStream.emit('error', err);
  };

  const datasourceOptions = { file: filePath };
  switch (fileType) {
    case 'shp':
      datasourceOptions.type = 'shape';
      break;
    case 'csv':
      datasourceOptions.type = 'csv';
      datasourceOptions.strict = true;
      break;
    default:
      return handleError(invalid(`Unrecognized type "${fileType}"`));
  }

  let datasource;
  try {
    datasource = new mapnik.Datasource(datasourceOptions);
  } catch (err) {
    return handleError(invalid(err.message));
  }

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
