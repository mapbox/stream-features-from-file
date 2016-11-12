'use strict';

const filesniffer = require('mapbox-file-sniff');

/**
 * Returns the file type determined by mapbox-file-sniff.
 * Uses `quaff` to handle large files.
 *
 * @param {string} filePath
 * @return {string}
 */
const getFileType = (filePath) => {
  return new Promise((resolve, reject) => {
    filesniffer.quaff(filePath, false, (err, fileType) => {
      if (err) return reject(err);
      resolve(fileType);
    });
  });
};

module.exports = getFileType;
