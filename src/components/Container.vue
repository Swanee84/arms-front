<template>
  <div>
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <template v-for="item in menuItems">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-col>
          </v-row>
          <v-list-group v-if="item.children" :key="item.text" v-model="item.model" :prepend-icon="item.model ? item.icon : item['icon-alt']" append-icon no-action>
            <template v-slot:activator>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i" link :to="child.toRoute">
              <v-list-item-icon v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" :to="item.toRoute">
            <v-list-item-icon v-if="item.icon">
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Palette &amp; U</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn small color="error" ripple @click.native="signOutUser"><v-icon>exit_to_app</v-icon>logout</v-btn>
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
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      drawer: null,
      loading: true,
    };
  },
  components: {},
  props: {},

  created() {
    this.tokenRefresh();
  },

  mounted() {
    this.loading = false;
  },

  methods: {
    ...mapActions(['tokenRefresh', 'signOutUser']),
  },

  computed: {
    ...mapGetters(['menuItems']),
  },

  watch: {},
};
</script>
<style>
.dialogScrollHeight {
  height: calc(100vh - 232px);
}
</style>
