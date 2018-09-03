'use strict';
const fs = require('fs');
const path = require('path');

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  }
  if (mkdirsSync(path.dirname(dirname))) {
    fs.mkdirSync(dirname);
    return true;
  }
}

exports.createFolderByDirname = dirname => {
  mkdirsSync(dirname);
};
