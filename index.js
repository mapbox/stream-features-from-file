'use strict';

const stream = require('stream');
const getFileType = require('./lib/getFileType');
const streamFromMapnik = require('./lib/streamFromMapnik');
const streamFromGeojson = require('./lib/streamFromGeojson');

/**
 * Returns a readable object-mode stream of GeoJSON features
 * derived from the provided file.
 *
 * @param {string} filePath
 * @return {ReadableStream}
 */
const streamFeaturesFromFile = (filePath) => {
  const featureStream = new stream.Readable({
    objectMode: true,
    read: () => {},
  });

  getFileType(filePath)
    .then((fileType) => {
      if (fileType === 'geojson') {
        return streamFromGeojson(featureStream, filePath);
      }
      return streamFromMapnik(featureStream, filePath, fileType);
    })
    .catch((err) => featureStream.emit('error', err));

  return featureStream;
};

module.exports = streamFeaturesFromFile;