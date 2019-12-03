import Vue from 'vue';
import App from './App.vue';
import router from './router/index';
import store from './store';
import vuetify from './plugins/vuetify';

import axiosInstance from './plugins/axios';
import moment from 'vue-moment';
import common from './plugins/common';
import rules from './plugins/rules';

Vue.config.productionTip = false;

Vue.prototype.$http = axiosInstance;
Vue.prototype.$common = common;
Vue.prototype.$rules = rules;

Vue.use(moment);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');
