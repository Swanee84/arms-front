import axios from 'axios';

const url = process.env.NODE_ENV === 'production' ? 'http://localhost:10100/api/' : 'http://localhost:10100/api/';

const axiosInstance = axios.create({
  baseURL: url,
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401 || error.response.status === 403) {
      // 401 은 토큰이 없는 상태, 403 은 토큰 만료, 혹은 디코드 에러
      location.replace('/signin');
    } else if (error.response.status === 400) {
      alert(`[${error.response.status}]\n[${error.response.data.code}]\n입력 항목을 확인해주세요.`);
    } else {
      alert(`[${error.response.status}]\n[${error.response.data.message}]\n관리자에게 문의해주세요.`);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
