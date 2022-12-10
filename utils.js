const _ = require('lodash');

const getFileDate = function() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const fileDate = `${month}-${day}-${hour}:${minute}`;
  return fileDate;
};

module.exports = { getFileDate };
