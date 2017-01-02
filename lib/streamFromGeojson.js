'use strict';

const fs = require('fs');
const geojsonStream = require('geojson-stream');
const invalid = require('./invalid');

/**
 * Pushes GeoJSON from a GeoJSON file (containing a Feature or FeatureCollection)
 * into a readable stream.
 *
 * @param {ReadableStream} featureStream
 * @param {string} filePath
 */
const streamFromGeojson = (featureStream, filePath) => {
  const handleError = (err) => {
    featureStream.emit('error', err);
  };

  const reader = fs.createReadStream(filePath);
  const parser = geojsonStream.parse();

  reader.on('error', handleError);
  parser.on('error', (err) => {
    return handleError(invalid(`'Invalid JSON: ${err.message}'`));
  });

  reader.pipe(parser)
    .on('data', (feature) => featureStream.push(feature))
    .on('end', () => featureStream.push(null));
};

module.exports = streamFromGeojson;
