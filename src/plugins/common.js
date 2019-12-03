import api from './axios';

let detailCodeName = null; // 어떻게 사용될지 몰라서 export 함. object 에 직접 접근이 필요 없으면 export 제거하자.
let detailCodeObject = null;
let groupCodeObject = null;
let userInfo = null;
const constAcademyId = 1;

function getUserInfo() {
  return userInfo;
}

function setUserInfo(info) {
  userInfo = info;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function getPagePerListCount() {
  return parseInt(localStorage.listCnt) || 10;
}

function setPagePerListCount(listCnt) {
  localStorage.listCnt = listCnt;
}

// <--- Detail Code 불러오기 --->

async function getDetailCodeName(key) {
  if (!detailCodeName) {
    await selAllDetailCodeList();
  }
  if (key) {
    return detailCodeName[key];
  }
  return detailCodeName;
}

function getDetailCodeObject(key) {
  if (key) {
    return detailCodeObject[key];
  }
  return detailCodeObject;
}

async function selAllDetailCodeList() {
  const response = await api.post('/code/selAllDetailCodeList', {
    academyId: constAcademyId,
  });
  let detailCodeList = response.data.model;
  detailCodeName = {};
  detailCodeObject = {};
  for (let code of detailCodeList) {
    detailCodeName[code.dtlCd] = code.dtlCdName;
    detailCodeObject[code.dtlCd] = code;
  }
  return detailCodeName;
}

// <--- Group Code 불러오기 --->
async function getAllGroupCodeObjects(key) {
  console.log('getAllGroupCodeObjects >>> ', key);
  const response = await api.post('/code/selGroupCodeInDetailCodeList', {
    academyId: constAcademyId,
  });
  groupCodeObject = {};
  const groupCodeList = response.data.model;
  for (const groupCode of groupCodeList) {
    groupCodeObject[groupCode.grpCd] = groupCode;
  }
}

async function getGroupDetailList(key, val1, val2, val3) {
  if (!groupCodeObject) {
    await getAllGroupCodeObjects(key);
  }
  const groupCode = groupCodeObject[key];
  const cdDtlList = groupCode.cdDtlList;
  let returnList = [];
  if (val1 || val2 || val3) {
    for (const code of cdDtlList) {
      if ((!val1 || val1 == code.val1) && (!val2 || val2 == code.val2) && (!val3 || val3 == code.val3)) {
        returnList.push(code);
      }
    }
  } else {
    returnList = cdDtlList.slice();
  }
  return returnList;
}

////////////////////
// async function getGroupCodeName(key) {
//   if (isEmpty(groupCodeName)) {
//     await selAllGroupCodeList();
//   }
//   return groupCodeName[key];
// }

// async function selAllGroupCodeList() {
//   const response = await this.$http.post('/code/selGroupCodeList');
//   const groupCodeList = response.data;
//   for (let code of groupCodeList) {
//     groupCodeName[code.grpCd] = code.grpCdName;
//     groupCodeObject[code.grpCd] = code;
//   }
// }

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
  getUserInfo,
  setUserInfo,

  getDetailCodeName,
  getDetailCodeObject,
  selAllDetailCodeList,

  getAllGroupCodeObjects,
  getGroupDetailList,

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
  constAcademyId,
};
