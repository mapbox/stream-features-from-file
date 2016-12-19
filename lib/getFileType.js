'use strict';

const filesniffer = require('mapbox-file-sniff');

/**
 * Returns a Promsie that resolves with a file's type
 * as determined by mapbox-file-sniff.
 * Uses `quaff` to handle large files.
 *
 * @param {string} filePath
 * @return {Promise<string>}
 */
const getFileType = (filePath) => {
  return new Promise((resolve, reject) => {
    filesniffer.quaff(filePath, false, (err, fileType) => {
      if (err && err.code === 'ENOENT') return reject(err);
      if (err) return reject(new Error(`Unable to parse file "${filePath}" as geospatial data`));
      resolve(fileType);
    });
  });
};

module.exports = getFileType;
