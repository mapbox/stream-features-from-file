'use strict';

const util = require('util');

module.exports = function invalid(message) {
  if (typeof message === 'string') {
    message = util.format.apply(this, arguments);
  }

  const err = message instanceof Error ? message : new Error(message);
  err.code = 'EINVALID';

  return err;
};
