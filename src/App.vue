<template>
  <v-app id="inspire">
    <router-view />
  </v-app>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'App',
  data() {
    return {
      //
    };
  },

  created() {
    this.selAllCodeInfo();
  },

  methods: {
    ...mapActions(['selAllCodeInfo']),
  },

  computed: {},
};
</script>
