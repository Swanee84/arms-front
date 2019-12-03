import Vue from 'vue';
import VueRouter from 'vue-router';
import Container from '../components/Container.vue';
import SignIn from '../views/SignIn.vue';
import Dashboard from '../views/Dashboard.vue';
import CodeList from '../views/CodeList.vue';
import UserList from '../views/UserList.vue';
import UserDetail from '../views/UserDetail.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Container,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: '대시보드',
        component: Dashboard,
      },
      {
        path: '/code',
        name: '코드관리',
        component: CodeList,
      },
      {
        path: '/user/:role',
        name: '수강생 관리',
        component: UserList,
      },
      {
        path: '/user_detail/:role/:userId',
        name: '수강생 상세',
        component: UserDetail,
      },
    ],
  },
  {
    path: '/signin',
    name: '로그인 화면',
    component: SignIn,
  },
];

const router = new VueRouter({
  // mode: 'history',
  routes,
});

export default router;
