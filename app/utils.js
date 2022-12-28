import _ from 'lodash';

const getFileDate = function() {
  const date = new Date();
  const day = date.getDate();
  const month = ( date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const fileDate = `${month}-${day}-${year}-${hour}:${minute}`;
  return fileDate;
};

export { getFileDate };
