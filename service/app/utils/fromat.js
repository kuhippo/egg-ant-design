'use strict';


module.exports = (success = true, data = null, msg = '', code = 200) => {
  return {
    success,
    data,
    msg,
    code,
  };
};
