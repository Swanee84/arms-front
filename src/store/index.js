import Vue from 'vue';
import Vuex from 'vuex';
import router from '../router/index';
import api from '../plugins/axios';

Vue.use(Vuex);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getters = {
  userInfo: state => {
    return state.userInfo;
  },

  isSuperUser: state => {
    return state.userRole === 'ADMIN' || state.userRole === 'PRESIDENT';
  },

  userRole: state => {
    return state.userRole;
  },

  menuItems: state => {
    return state.menuItems;
  },

  detailCodeName: state => {
    console.log('[STORE] detailCodeName :: ', state.detailCodeName);
    return state.detailCodeName;
  },

  detailCodeObject: state => {
    return state.detailCodeObject;
  },

  groupDetailList: state => async (key, val1, val2, val3) => {
    const groupCodeObject = state.groupCodeObject;
    let groupCode = groupCodeObject[key];
    if (!groupCode) {
      for (let i = 0; i < 3; i++) {
        await sleep(100);
        groupCode = groupCodeObject[key];
        if (groupCode) {
          break;
        }
      }
    }
    const cdDtlList = groupCode.cdDtlList;
    let returnList = [];
    if (val1 || val2 || val3) {
      for (const code of cdDtlList) {
        if ((!val1 || code.val1.indexOf(val1) > -1) && (!val2 || code.val2.indexOf(val2) > -1) && (!val3 || code.val3.indexOf(val3) > -1)) {
          returnList.push(code);
        }
      }
    } else {
      returnList = cdDtlList.slice();
    }
    return returnList;
  },

  academyId: state => {
    return state.academyId;
  },

  branchId: state => {
    return state.branchId;
  },
};

export default new Vuex.Store({
  state: {
    userInfo: null,
    userRole: 'NONE',
    menuItems: null,

    detailCodeName: {},
    detailCodeObject: {},
    groupCodeObject: {},

    academyId: 1,
    branchId: 1,
  },

  getters,

  mutations: {
    async selAllDetailCodeList(state) {
      const response = await api.post('/code/selAllDetailCodeList', {
        academyId: state.academyId,
      });
      let detailCodeList = response.data.model;
      for (let code of detailCodeList) {
        state.detailCodeName[code.dtlCd] = code.dtlCdName;
        state.detailCodeObject[code.dtlCd] = code;
      }
      console.log('[END] selAllDetailCodeList()');
    },

    async getAllGroupCodeObjects(state) {
      console.log('[START] getAllGroupCodeObjects()');
      const response = await api.post('/code/selGroupCodeInDetailCodeList', {
        academyId: state.academyId,
      });
      const groupCodeList = response.data.model;
      for (const groupCode of groupCodeList) {
        state.groupCodeObject[groupCode.grpCd] = groupCode;
      }
      console.log('[END] getAllGroupCodeObjects()');
    },

    async signInUser(state, payload){
      const response = await api.post('/auth/signIn', {
        email: payload.email,
        password: payload.password,
      });
      console.log('response.data', response.data);
      const data = response.data;
      if (data.result) {
        localStorage.token = data.code;
        api.defaults.headers['Authorization'] = data.code;
        state.userInfo = data.model;
        state.userRole = data.model.role;
        state.menuItems = data.jsonData;

        router.replace('/dashboard');
      } else {
        alert(response.data.message);
      }
    },

    async tokenRefresh(state) {
      if (localStorage.token) {
        api.defaults.headers['Authorization'] = localStorage.token;
        const response = await api.get('auth/tokenRefresh');
        const data = response.data;
        if (data.result) {
          localStorage.token = data.code;
          api.defaults.headers['Authorization'] = data.code;
          state.userInfo = data.model;
          state.userRole = data.model.role;
          state.menuItems = data.jsonData;
        } else {
          router.replace('/signin');
        }
      } else {
        router.replace('/signin');
      }
    },

    signOutUser(state) {
      state.userInfo = null;
      delete localStorage.token;
      router.replace('/signin');
    },
  },

  actions: {
    signInUser(context, payload) {
      context.commit('signInUser', payload);
    },

    tokenRefresh(context) {
      context.commit('tokenRefresh');
    },

    signOutUser(context) {
      context.commit('signOutUser');
    },

    selAllCodeInfo(context) {
      context.commit('selAllDetailCodeList');
      context.commit('getAllGroupCodeObjects');
    },
  },
  modules: {},
});
