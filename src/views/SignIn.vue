<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Pallete &amp; U</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form ref="signInForm" lazy-validation>
                  <v-text-field label="로그인 이메일" v-model="email" name="login" prepend-icon="person" type="text" @keyup.enter="nextField" />
                  <v-text-field label="비밀번호" v-model="password" name="password" prepend-icon="lock" type="password" @keyup.enter="loginAction" />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="signInUser()">로그인</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import rules from '../plugins/rules';

export default {
  data() {
    return {
      rules,
      email: '',
      password: '',
    };
  },

  methods: {
    async signInUser() {
      if (!this.$refs.signInForm.validate()) {
        return;
      }
      this.$store.dispatch('signInUser', { email: this.email, password: this.password });
    },

    nextField() {
      this.$refs.password.focus();
    },
  },
};
</script>
