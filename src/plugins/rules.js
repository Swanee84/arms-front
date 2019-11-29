// Form 에서 각종 input 들의 rule 를 정리

const requierRule = v => !!v || v === '0' || '필수 입력입니다.';
const numGtZeroRule = v => (v && v > 0) || '1 이상의 값을 입력하세요.';
const numGtEqZeroRule = v => ((v || v === 0) && v >= 0) || '0 이상의 값을 입력하세요.';
const numLt100Rule = v => (v && v < 100) || '100 미만의 값을 입력하세요.';
const emailRule = v => /.+@.+\..+/.test(v) || '이메일 형식에 맞지 않습니다.';
const charGt4Rule = v => (v && v.length >= 4) || '4자리 이상 입력하세요.';
const datePickerRule = v => (v && /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/.test(v)) || '날짜 형식에 맞게 입력해주세요.(2019-04-09)';
const timePickerRule = v => (v && /(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/.test(v)) || '시간 형식에 맞게 입력해주세요.(15:59)';

export default {
  requireRules: [requierRule],
  numberRules: [numGtZeroRule],
  numberRulesIncZero: [
    // requierRule,
    numGtEqZeroRule,
  ],
  numberRules0To100: [numGtEqZeroRule, numLt100Rule],

  emailRules: [requierRule, emailRule],

  passWordRules: [requierRule, charGt4Rule],

  resvEmailRules: [emailRule],

  dateRules: [datePickerRule],

  timeRules: [timePickerRule],
};
