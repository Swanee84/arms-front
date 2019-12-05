import api from '../plugins/axios';

export default {
  state: {
    STUDENT: null,
    TEACHER: null,
    DIRECTOR: null,
    PRESIDENT: null,
  },

  getters: {
    userList: state => role => {
      const list = state[role];
      return list;
    },
  },

  mutations: {
    addUserList(state, data) {
      state[data.role] = data.list;
    },
  },

  actions: {
    async selUserList(context, search) {
      const response = await api.post('user/selUserList', search);
      if (response.data.result) {
        context.commit('addUserList', { role: search.role, list: response.data.model });
        return response.data.model;
      } else {
        alert('조회 오류 Param\n', JSON.stringify(search));
      }
      return [];
    },
  },
};
