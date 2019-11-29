<template>
  <div>
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <template v-for="item in items">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-col>
          </v-row>
          <v-list-group
            v-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon
            no-action
          >
            <template v-slot:activator>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </template>
            <v-list-item
              v-for="(child, i) in item.children"
              :key="i"
              link
              :to="child.toRoute"
            >
              <v-list-item-icon v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" :to="item.toRoute">
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>INTL' Taxi System</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn small color="error" ripple @click.native="logoutAction"
        ><v-icon>exit_to_app</v-icon>logout</v-btn
      >
    </v-app-bar>
    <v-content>
      <v-container fluid class="fill-height">
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer app>
      <span>&copy; 2019 KST</span>
    </v-footer>
  </div>
</template>

<script>
import common from '../plugins/common';

export default {
  data() {
    return {
      drawer: null,
      loading: true,
      items: [],
    };
  },
  components: {},
  props: {},
  async created() {
    await this.tokenRefresh();
  },

  mounted() {
    this.loading = false;
  },

  methods: {
    async tokenRefresh() {
      if (localStorage.token) {
        this.$http.defaults.headers['Authorization'] = localStorage.token;
        const response = await this.$http.get('auth/tokenRefresh');
        const token = response.data.code;
        localStorage.token = token;
        this.$http.defaults.headers['Authorization'] = token;
        this.items = response.data.jsonData;
        // let initUrl = response.data.returnDto.initUrl;
        // if (!initUrl) {
        //   initUrl = '/dashboard';
        // }
        // localStorage.initUrl = initUrl;
        // if (this.$route.fullPath == '/') {
        //   this.$router.replace(initUrl);
        // }
      } else {
        this.$router.replace('/signin');
      }
    },

    logoutAction() {
      delete localStorage.token;
      this.$router.replace('/signin');
    },
  },

  watch: {},
};
</script>
<style>
.dialogScrollHeight {
  height: calc(100vh - 232px);
}
</style>
