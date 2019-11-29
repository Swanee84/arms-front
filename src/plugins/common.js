import api from './axios';

let detailCodeName = {}; // 어떻게 사용될지 몰라서 export 함. object 에 직접 접근이 필요 없으면 export 제거하자.
let detailCodeObject = null;
let groupCodeName = {};
let groupCodeObject = {};
const constAcademyId = 1;

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function getPagePerListCount() {
  return parseInt(localStorage.listCnt) || 10;
}

function setPagePerListCount(listCnt) {
  localStorage.listCnt = listCnt;
}

async function getDetailCodeName(key) {
  if (isEmpty(detailCodeName)) {
    await selAllDetailCodeList();
  }
  if (key) {
    return detailCodeName[key];
  }
  return detailCodeName;
}

async function getDetailCodeObject(key) {
  if (!detailCodeObject) {
    await selAllDetailCodeList();
  }
  return detailCodeObject[key];
}

async function selAllDetailCodeList() {
  const response = await api.post('/code/selAllDetailCodeList', {
    academyId: constAcademyId,
  });
  let detailCodeList = response.data.model;
  detailCodeName = {};
  detailCodeObject = {};
  for (let code of detailCodeList) {
    detailCodeName[code.dtlCd] = code.dtlCdNm;
    detailCodeObject[code.dtlCd] = code;
  }
  return detailCodeName;
}

////////////////////
async function getCodeGroup(key) {
  const codeGroup = await getGroupCodeObject(key);
  return codeGroup;
}

async function getGroupCodeObject(key) {
  let groupCode = groupCodeObject[key];
  if (!groupCode) {
    const response = await api.post('/code/selGroupCodeInDetailCodeList', {
      academyId: constAcademyId,
      grpCdList: [key],
    });
    if (response.data && response.data.result && response.data.model.length > 0) {
      groupCodeObject[key] = response.data.model[0];
      groupCode = response.data.model[0];
    }
  }
  return groupCode;
}

async function getCodeGroupList(keyList) {
  const codeGroupList = await getGroupCodeObjects(keyList);
  return codeGroupList;
}

async function getGroupCodeObjects(keyList) {
  const returnGrpObject = {};
  const grpCdList = [];
  for (const key of keyList) {
    const groupCode = groupCodeObject[key];
    if (!groupCode) {
      grpCdList.push(key);
    } else {
      returnGrpObject[key] = groupCode;
    }
  }

  if (grpCdList.length > 0) {
    const response = await api.post('/code/selGroupCodeInDetailCodeList', {
      academyId: constAcademyId,
      grpCdList,
    });
    const groupCodeList = response.data;
    for (const groupCode of groupCodeList) {
      groupCodeObject[groupCode.grpCd] = groupCode;
      returnGrpObject[groupCode.grpCd] = groupCode;
    }
  }
  return returnGrpObject;
}

async function getAllGroupCodeObjects() {
  const response = await api.post('/code/selGroupCodeInDetailCodeList', {
    academyId: constAcademyId,
  });
  const groupCodeList = response.data;
  for (const groupCode of groupCodeList) {
    groupCodeObject[groupCode.grpCd] = groupCode;
  }
  return groupCodeObject;
}

async function getGroupDetailList(key, val1, val2, val3, val5, val6) {
  let groupCode = groupCodeObject[key];
  if (!groupCode) {
    groupCode = await getGroupCodeObject(key);
    if (!groupCode) {
      return [];
    }
  }

  let cdDtlList = groupCode.cdDtlList;
  let returnList = [];
  if (val1 || val2 || val3 || val5 || val6) {
    for (const code of cdDtlList) {
      if ((!val1 || val1 == code.val1) && (!val2 || val2 == code.val2) && (!val3 || val3 == code.val3) && (!val5 || val5 == code.val5) && (!val6 || val6 == code.val6)) {
        returnList.push(code);
      }
    }
  } else {
    returnList = cdDtlList.slice();
  }
  return returnList;
}

////////////////////
async function getGroupCodeName(key) {
  if (isEmpty(groupCodeName)) {
    await selAllGroupCodeList();
  }
  return groupCodeName[key];
}

async function selAllGroupCodeList() {
  const response = await this.$http.post('/code/selGroupCodeList');
  const groupCodeList = response.data;
  for (let code of groupCodeList) {
    groupCodeName[code.grpCd] = code.grpCdNm;
    groupCodeObject[code.grpCd] = code;
  }
}

function convertPhoneString(number) {
  if (!number) {
    return '';
  }
  return number.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}

function getLanguageImageName(code) {
  if (code == 'LANG001') {
    return 'images/english.png';
  }
  if (code == 'LANG002') {
    return 'images/chinese.png';
  }
  if (code == 'LANG003') {
    return 'images/japanese.png';
  }
  return '';
}

function getChannelImageName(code) {
  if (code == 'CHN001') {
    return 'images/call.png';
  }
  if (code == 'CHN002') {
    return 'images/mail.png';
  }
  if (code == 'CHN003') {
    return 'images/homepage.png';
  }
  if (code == 'CHN004') {
    return 'images/place.png';
  }
  return '';
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

function abbreviateString2(value, limit = 8) {
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
  getDetailCodeName,
  getDetailCodeObject,

  getCodeGroup,
  getCodeGroupList,

  getAllGroupCodeObjects,
  getGroupCodeName,
  selAllDetailCodeList,
  getGroupDetailList,

  detailCodeName,
  convertPhoneString,
  isEmpty,
  getLanguageImageName,
  addComma,
  lpad,
  calcDivRound,

  getYearMonthArray,
  getPagePerListCount,
  setPagePerListCount,

  abbreviateString,
  abbreviateString2,
  getChannelImageName,

  saveFile,
  constAcademyId,
};
