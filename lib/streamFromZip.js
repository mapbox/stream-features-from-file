'use strict';

const invalid = require('./invalid');
const shpFairy = require('shapefile-fairy');
const streamFromMapnik = require('./streamFromMapnik');

/**
 * Returns a Promise that resolves with a file's type
 * as determined by mapbox-file-sniff.
 * Uses `shapfile-fairy` to unzip and identify the .shp file,
 * then stream features via Mapnik.
 *
 * @param {ReadableStream} featureStream
 * @param {string} filePath
 * @return {Promise<ReadableStream>}
 */
const streamFromZip = (featureStream, filePath) => {
  return new Promise((resolve, reject) => {
    shpFairy(filePath, (err, shpFile) => {
      if (err && err.code === 'EINVALID') return reject(invalid(`Invalid zipfile: ${err.message}`));
      if (err) return reject(err);
      return resolve(streamFromMapnik(featureStream, shpFile, 'shp'));
    });
  });
};

module.exports = streamFromZip;
