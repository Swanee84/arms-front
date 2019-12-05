import Vue from 'vue';
import Vuex from 'vuex';
import router from '../router/index';
import api from '../plugins/axios';
import user from './user';

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
    userRole: null,
    menuItems: null,

    detailCodeName: {},
    detailCodeObject: {},
    groupCodeObject: {},

    academyId: 1,
    branchId: 1,
  },

  getters,

  mutations: {
    selAllDetailCodeList(state, list) {
      for (let code of list) {
        state.detailCodeName[code.dtlCd] = code.dtlCdName;
        state.detailCodeObject[code.dtlCd] = code;
      }
      // console.log('[END] selAllDetailCodeList()');
    },

    getAllGroupCodeObjects(state, list) {
      for (const groupCode of list) {
        state.groupCodeObject[groupCode.grpCd] = groupCode;
      }
      // console.log('[END] getAllGroupCodeObjects()');
    },

    setUserInfo(state, data) {
      localStorage.token = data.code;
      api.defaults.headers['Authorization'] = data.code;
      state.userInfo = data.model;
      state.userRole = data.model.role;
      state.menuItems = data.jsonData;
    },

    signOutUser(state) {
      state.userInfo = null;
      delete localStorage.token;
      router.replace('/signin');
    },
  },

  actions: {
    async signInUser(context, payload) {
      const response = await api.post('/auth/signIn', {
        email: payload.email,
        password: payload.password,
      });
      const data = response.data;
      if (data.result) {
        context.commit('setUserInfo', data);
        router.replace('/dashboard');
      } else {
        alert(data.message);
      }
    },

    async tokenRefresh(context) {
      if (localStorage.token && !context.state.userInfo) {
        api.defaults.headers['Authorization'] = localStorage.token;
        const response = await api.get('auth/tokenRefresh');
        const data = response.data;
        if (data.result) {
          context.commit('setUserInfo', data);
        } else {
          alert(data.message);
          router.replace('/signin');
        }
      } else if (!context.state.userInfo) {
        router.replace('/signin');
      }
    },

    signOutUser(context) {
      context.commit('signOutUser');
    },

    async selAllCodeInfo(context) {
      // console.log('[START] selAllDetailCodeList()');
      api
        .post('/code/selAllDetailCodeList', {
          academyId: context.state.academyId,
        })
        .then(response => {
          const detailCodeList = response.data.model;
          context.commit('selAllDetailCodeList', detailCodeList);
          // console.log(`context.commit('selAllDetailCodeList') 끝`);
        });

      // console.log('[START] selGroupCodeInDetailCodeList()');
      api
        .post('/code/selGroupCodeInDetailCodeList', {
          academyId: context.state.academyId,
        })
        .then(response => {
          const groupCodeList = response.data.model;
          context.commit('getAllGroupCodeObjects', groupCodeList);
          // console.log(`context.commit('getAllGroupCodeObjects') 끝`);
        });
    },
  },
  modules: {
    user,
  },
});
