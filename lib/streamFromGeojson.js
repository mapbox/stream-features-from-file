'use strict';

const fs = require('fs');
const geojsonStream = require('geojson-stream');

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
    err.message = `Invalid JSON: ${err.message}`;
    handleError(err);
  });

  reader.pipe(parser)
    .on('data', (feature) => featureStream.push(feature))
    .on('end', () => featureStream.push(null));
};

module.exports = streamFromGeojson;
