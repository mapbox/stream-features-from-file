'use strict';

const stream = require('stream');
const getFileType = require('./lib/getFileType');
const streamFromMapnik = require('./lib/streamFromMapnik');
const streamFromGeojson = require('./lib/streamFromGeojson');
const shpFairy = require('shapefile-fairy');
const invalid = require('./lib/invalid');

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

  const handleError = (err) => {
    featureStream.emit('error', err);
  };

  getFileType(filePath)
    .then((fileType) => {
      if (fileType === 'geojson') {
        return streamFromGeojson(featureStream, filePath);
      }
      if (
        fileType === 'csv'
        || fileType === 'shp'
      ) {
        return streamFromMapnik(featureStream, filePath, fileType);
      }
      if (fileType === 'zip') {
        shpFairy(filePath, (err, shpFile) => {
          if (err && err.code === 'EINVALID') {
            return handleError(invalid('Invalid zipfile: ' + err.message));
          }
          if (err) return handleError(err);
          return streamFromMapnik(featureStream, shpFile, 'shp');
        });
      }
      else return handleError(invalid(`Unknown file type "${fileType}": accepts .geojson, .csv, or .shp (zipped and unzipped)`));
    })
    .catch((err) => featureStream.emit('error', err));

  return featureStream;
};

module.exports = streamFeaturesFromFile;
