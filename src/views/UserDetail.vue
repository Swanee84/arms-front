<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-row dense>
      <v-col cols="12">
        <v-card class="mb-3">
          <v-toolbar flat dense>
            <v-toolbar-title v-if="userData">[{{ userData.name }}] 의 정보</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn color="primary" v-if="!isEditMode" outlined @click.native="moveUserId(prevUserId)" :disabled="prevUserId === -1" class="mx-4"><v-icon>navigate_before</v-icon>PREV</v-btn>
            <v-btn color="primary" v-if="!isEditMode" outlined @click.native="moveUserId(nextUserId)" :disabled="nextUserId === -1">NEXT<v-icon>navigate_next</v-icon></v-btn>
          </v-toolbar>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card v-if="userData">
          <v-form ref="inputForm" lazy-validation>
            <v-card-text>
              <v-container>
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field label="사용자 유형" :value="detailCodeName[role]" readonly />
                  </v-col>
                  <!-- <v-col cols="12" sm="6" md="6">
                  </v-col> -->
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="userData.email" label="Email" :rules="$rules.optionalEmailRules" :readonly="!isEditMode" />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="userData.name" label="이름" :rules="$rules.requireRules" :readonly="!isEditMode" />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="userData.phoneNo" v-mask="mask.phoneNoMask" label="전화번호" :rules="$rules.phoneRules" :readonly="!isEditMode" />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-menu v-model="birthDatePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="userData.birthday" label="생년월일" v-mask="mask.dateMask" prepend-icon="event" @click:prepend="birthDatePicker = isEditMode && true" :rules="$rules.dateRules" :readonly="!isEditMode" />
                      </template>
                      <v-date-picker v-model="userData.birthday" @input="birthDatePicker = false" />
                    </v-menu>
                  </v-col>
                  <v-col v-if="!isEditMode" cols="12" sm="6" md="6">
                    <v-text-field label="등록일시" :value="$moment(userData.regDt).format('YYYY-MM-DD HH:mm:ss')" readonly />
                  </v-col>
                  <v-col v-if="!isEditMode" cols="12" sm="6" md="6">
                    <v-text-field label="최종 정보 수정일시" :value="$moment(userData.modDt).format('YYYY-MM-DD HH:mm:ss')" readonly />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions v-if="isEditMode">
            <v-btn color="primary" outlined @click.native="cancelEdit()"><v-icon>cancel</v-icon>수정 취소</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click.native="initPassword()">비밀번호 초기화</v-btn>
            <v-btn color="primary" outlined @click.native="updUser()"><v-icon>archive</v-icon>수정</v-btn>
          </v-card-actions>
          <v-card-actions v-else>
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click="userEditMode()">정보 변경</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mask } from 'vue-the-mask';

export default {
  data() {
    return {
      loader: true,
      detailCodeName: {},

      userId: 0,
      nextUserId: 0,
      prevUserId: 0,
      role: '',

      userData: null,
      userRole: '',

      mask: {
        dateMask: '####-##-##',
        phoneNoMask: '###-####-####',
      },
      birthDatePicker: false,

      isEditMode: false,
    };
  },

  components: {},

  directives: {
    mask,
  },

  beforeMount() {
    console.log('beforeMount this.$route', this.$route);
    this.role = this.$route.params.role;
    this.userId = parseInt(this.$route.params.userId);

    this.getInitData();
    // var queryObj = {}
    // queryObj.pagenumber = parseInt(this.$route.query.pagenumber) || 1
    // this.$router.push({ path: 'driver', query: queryObj })
  },
  mounted() {
    this.getUserInfo();
    this.getUserDetailInfo();
  },

  beforeUpdate() {
    console.log(`beforeUpdate this.$route`, this.$route);
  },

  methods: {
    async getInitData() {
      this.detailCodeName = await this.$common.getDetailCodeName();
    },

    async getUserDetailInfo() {
      console.log('=== GET USER DETAIL DATA ===');
      this.loader = true;

      const search = { role: this.role, userId: this.userId };
      const response = await this.$http.post('user/selUserDetail', search);
      if (response.data.result) {
        const data = response.data.model;
        data.phoneNo = this.$common.convertPhoneString(data.phoneNo);
        this.userData = data;
        this.prevUserId = response.data.jsonData.prevUserId;
        this.nextUserId = response.data.jsonData.nextUserId;
      } else {
        alert('조회 오류 Param: ', search);
      }

      console.log('========== END ==========');
      this.loader = false;
    },

    getUserInfo() {
      const userInfo = this.$common.getUserInfo();
      if (!userInfo) {
        setTimeout(() => {
          this.getUserInfo();
        }, 100);
      } else {
        this.userRole = userInfo.role;
      }
    },

    userEditMode() {
      this.isEditMode = true;
      this.originItem = Object.assign({}, this.userData);
    },

    cancelEdit() {
      this.isEditMode = false;
      this.userData = Object.assign({}, this.originItem);
    },

    async updUser() {
      const updItem = {};
      const userItem = this.userData;
      const originItem = this.originItem;
      for (const key in originItem) {
        if (userItem[key] != originItem[key]) {
          updItem[key] = userItem[key];
        }
      }
      if (this.$common.isEmpty(updItem)) {
        alert('수정된 내용이 없습니다.');
        return
      }
      updItem.userId = this.userId;

      const response = await this.$http.post('user/updUser', { user: updItem });
      if (response.data.result) {
        alert('사용자 정보가 수정되었습니다.');
        this.isEditMode = false;
        this.getUserDetailInfo();
      } else {
        alert('사용자 정보수정이 실패하였습니다.\n관리자에게 문의 바랍니다.');
      }
    },

    async initPassword() {
      const phoneNo = this.userData.phoneNo;
      let password = '';
      if (/^\d{3}-\d{3,4}-\d{4}$/.test(phoneNo)) {
        password = phoneNo.split('-')[2];
      } else {
        alert('비밀번호 초기화는 사용자의 폰번호 뒤 4자리로 입력됩니다.\n휴대폰 번호를 정확하게 입력하세요.')
        return;
      }
      const confirmFlag = confirm(`${this.userData.name} 님의 비밀번호를 '${password}' 로 초기화 하시겠습니까?`);
      if (!confirmFlag) {
        return;
      }

      const response = await this.$http.post('user/updUser', { user: { userId: this.userId, password }});
      if (response.data.result) {
        alert('비밀번호가 초기화되었습니다. 사용자에게 확인 바랍니다.');
      } else {
        alert('비밀번호 초기화가 실패하였습니다.\n관리자에게 문의 바랍니다.');
      }
    },

    moveUserId(userId) {
      // this.userId = userId;
      // this.$router.push({ path: `/user_detail/${this.role}/${userId}` });
      this.$router.push({ name: '수강생 상세', params: { role: this.role, userId }});

      // this.getUserDetailInfo();
    },
  },

  computed: {
  },

  watch: {
    '$route.params.userId' (to, from) {
      console.log(`this.$route.params.userId :: to-${to}, from-${from}`)
      this.userId = to;
      this.getUserDetailInfo();
    },
  },


};
</script>
