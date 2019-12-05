function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function getPagePerListCount() {
  return parseInt(localStorage.listCnt) || 10;
}

function setPagePerListCount(listCnt) {
  localStorage.listCnt = listCnt;
}

function convertPhoneString(number) {
  if (!number) {
    return '';
  }
  return number.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}

function addComma(num) {
  if (!num) {
    num = 0;
  }
  const regexp = /\B(?=(\d{3})+(?!\d))/g;
  return num.toString().replace(regexp, ',');
}

function lpad(n, width) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function calcDivRound(val1, val2) {
  var num = 0;
  if (val2 != 0) {
    num = Math.round(val1 / val2);
  }
  return num;
}

// 조회 부분 연도/달 셋팅
function getYearMonthArray() {
  let date = new Date();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  // let startYear = 2014 // 2014년부터 ???
  let startYear = 2018;

  let selectYearList = [];
  for (let i = startYear; i <= year; i++) {
    let value = i.toString();
    selectYearList.push({ value: value, text: `${value} 년` });
  }

  let selectMonthList = [];
  for (let i = 1; i <= 12; i++) {
    let value = lpad(i, 2);
    selectMonthList.push({ value: value, text: `${value} 월` });
  }
  return {
    selectYearList,
    selectMonthList,
    year: year.toString(),
    month: lpad(month.toString(), 2),
  };
}

function abbreviateString(value, limit = 30) {
  // ES6 의 Default parameters https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Functions/Default_parameters
  if (value.length > limit) {
    return value.substr(0, limit) + '...';
  } else {
    return value;
  }
}

function saveFile(fileName, response) {
  const blobData = response.data;
  let url = URL.createObjectURL(blobData);
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = fileName;
  a.target = '_blank';
  a.click();
  document.body.removeChild(a);
}

// function getFileName(contentDisposition) {
//   let fileName = contentDisposition
//     .split(";")
//     .filter(ele => {
//       return ele.indexOf("fileName") > -1;
//     })
//     .map(ele => {
//       return ele.replace(/"/g, "").split("=")[1];
//     });
//   return fileName[0] ? fileName[0] : null;
// }

export default {
  convertPhoneString,
  isEmpty,
  addComma,
  lpad,
  calcDivRound,

  getYearMonthArray,

  getPagePerListCount,
  setPagePerListCount,

  abbreviateString,

  saveFile,
};
