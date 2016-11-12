'use strict';

const fs = require('fs');
const geojsonStream = require('geojson-stream');
const geojsonIsFeatureCollection = require('./geojsonIsFeatureCollection');

/**
 * Pushes GeoJSON from a GeoJSON file containing a Feature or FeatureCollection
 * into a readable stream.
 *
 * @param {ReadableStream} featureStream
 * @param {string} filePath
 */
const streamFromGeojson = (featureStream, filePath) => {
  const handleError = (err) => featureStream.emit('error', err);

  const pushFeature = () => {
    fs.readFile(filePath, 'utf8', (err, feature) => {
      if (err) return handleError(err);
      featureStream.push(JSON.parse(feature));
      featureStream.push(null);
    });
  };

  const pushFeatureCollection = () => {
    const reader = fs.createReadStream(filePath);
    const parser = geojsonStream.parse();

    reader.on('error', handleError);
    parser.on('error', handleError);

    reader.pipe(parser)
      .on('data', (feature) => featureStream.push(feature))
      .on('end', () => featureStream.push(null));
  };

  geojsonIsFeatureCollection(filePath).then((isCollection) => {
    if (isCollection) return pushFeatureCollection();
    pushFeature();
  });
};

module.exports = streamFromGeojson;
