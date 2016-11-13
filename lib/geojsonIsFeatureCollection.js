'use strict';

const fs = require('fs');
const split = require('split');

/**
 * Returns a boolean indicating if the GeoJSON in a file is
 * a FeatureCollection.
 *
 * Assumes the GeoJSON fits RFC 7946's guideline that
 * "features" and "geometry" members are defining members
 * that cannot be shared between types:
 * https://tools.ietf.org/html/rfc7946#section-7.1
 *
 * @param {string} filePath
 * @return {boolean}
 */
const geojsonIsFeatureCollection = (filePath) => {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(filePath);
    reader.on('error', reject);

    reader.pipe(split())
      .on('data', (line) => {
        if (line.indexOf('features') !== -1) {
          resolve(true);
          return reader.pause();
        }

        if (line.indexOf('geometry') !== -1) {
          resolve(false);
          return reader.pause();
        }
      })
      .on('end', () => {
        reject(new Error(`No features or geometry found in "${filePath}"`));
      });
  });
};

module.exports = geojsonIsFeatureCollection;
