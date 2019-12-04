<template>
  <v-app id="inspire">
    <router-view />
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      //
    };
  },

  beforeCreate() {
    this.$store.dispatch('selAllCodeInfo');
  },

  methods: {},

  computed: {},
};
</script>
