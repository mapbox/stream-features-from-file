'use strict';

const filesniffer = require('mapbox-file-sniff');
const invalid = require('./invalid');

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
      if (err && err.code === 'EINVALID') {
        return reject(invalid('Unable to parse file as geospatial data'));
      }
      if (err) return reject(err);
      resolve(fileType);
    });
  });
};

module.exports = getFileType;
