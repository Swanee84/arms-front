<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-row dense>
      <v-col cols="12" md="4">
        <v-card v-if="userData">
          <v-card-title>
            [{{ userData.name }}] 의 정보
            <v-spacer></v-spacer>
            <v-btn color="primary" v-if="!isEditMode" outlined @click.native="moveUserIndex(-1)" :disabled="userIndex === 0" class="mx-4"><v-icon>navigate_before</v-icon>PREV</v-btn>
            <v-btn color="primary" v-if="!isEditMode" outlined @click.native="moveUserIndex(1)" :disabled="userIndex >= (userItems.length - 1)">NEXT<v-icon>navigate_next</v-icon></v-btn>
          </v-card-title>
          <v-form ref="inputForm" lazy-validation>
            <v-card-text>
              <v-container>
                <v-row dense>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-if="!isChangeRole || !isEditMode" label="사용자 유형" :value="detailCodeName[role]" readonly />
                    <v-select v-else-if="isChangeRole && isEditMode" v-model="userData.role" :items="roleCodeList" label="사용자 유형 선택" item-text="dtlCdName" item-value="dtlCd" />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-checkbox v-if="isEditMode" v-model="isChangeRole" label="사용자 유형 변경" @change="checkRoleChangeAlert" />
                  </v-col>
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
      <v-col cols="12" md="4">
        <v-card v-if="courseList" >
          <v-card-title>
            사용자 수강 목록
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click.native="showCourseDialog()">수강등록</v-btn>
          </v-card-title>
          <v-list two-line class="overflow-y-auto">
            <template v-for="(item, index) in courseList">
              <v-list-item :key="`Course:${item.courseId}`" @click="selectCourse(item)" @mouseover="showByCourseIndex = index" @mouseleave="showByCourseIndex = null">
                <v-list-item-avatar color="teal darken-3">
                  <span>{{ index + 1 }}</span>
                </v-list-item-avatar>
                <v-list-item-action>
                  <v-icon v-if="selectedCourseId === selectedCourse.courseId">check</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>[ {{ item.startDate }} ~ {{ item.endDate }} ]</v-list-item-title>
                  <v-list-item-subtitle>
                    수업 사용 / 가능 횟수: {{ item.grpCdName }}<br />
                    사용 수업 횟수: {{ selectedCourse.lessonRecordList.length }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon ripple v-if="showByCourseIndex === index" @click="editCourseDialog(item, index)">
                    <v-icon color="grey lighten-1">edit</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-divider v-if="index < courseList.length - 1" :key="'divider_' + item.courseId"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card v-if="selectedCourse" >
          <v-card-title>
            사용자 수업 목록
          </v-card-title>
          <v-list two-line class="overflow-y-auto">
            <template v-for="(item, index) in selectedCourse.lessonRecordList">
              <v-list-item :key="`LR_${item.lrId}`" @click="selectLessonRecord(item)" @mouseover="showByLrIndex = index" @mouseleave="showByLrIndex = null">
                <v-list-item-avatar color="blue darken-3">
                  <span>{{ index + 1 }}</span>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>[ {{ detailCodeName[item.lessonType] }} ]</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.lesson.lessonDate }}: {{ item.lesson.lessonStartTime }} ~ {{ item.lesson.lessonEndTime }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider v-if="index < selectedCourse.lessonRecordList.length - 1" :key="'divider_' + item.lrId"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-col>
      <v-snackbar v-model="snackbarItem" top color="error"> {{ snackbarText }} <v-btn color="" outlined @click="snackbarItem = false">닫기</v-btn> </v-snackbar>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { mask } from 'vue-the-mask';

export default {
  data() {
    return {
      loader: true,
      roleCodeList: [],
      userItems: [],

      userIndex: 0,
      role: '',

      userData: null,
      courseList: null,
      lessonRecordList: null,

      showByCourseIndex: null,
      selectedCourse: null,
      selectedCourseId: 0,
      courseDialog: false,
      courseEditItem: {},
      courseDefaultItem: {},

      showByLrIndex: null,
      selectedLessonRecord: null,
      selectedLrId: 0,

      mask: {
        dateMask: '####-##-##',
        phoneNoMask: '###-####-####',
      },
      birthDatePicker: false,

      isEditMode: false,
      isChangeRole: false,

      snackbarItem: false,
      snackbarText: '',

    };
  },

  components: {},

  directives: {
    mask,
  },

  beforeMount() {
    console.log('beforeMount this.$route', this.$route);
    this.role = this.$route.params.role;
    this.userIndex = parseInt(this.$route.params.userIndex);
  },

  async mounted() {
    await this.getUserList();
    await this.getUserDetailInfo();
  },

  beforeUpdate() {
    console.log(`beforeUpdate this.$route`, this.$route);
  },

  methods: {
    ...mapActions(['selUserList']),

    async getUserList() {
      const list = this.userList(this.role);
      if (list) {
        this.userItems = list;
      } else {
        await this.getUserListData();
      }
    },

    async getUserListData() {
      console.log('=== GET USER LIST DATA ===');
      this.loader = true;
      const search = { academyId: this.academyId, branchId: this.branchId, role: this.role };
      this.userItems = await this.selUserList(search);
      console.log('========== END ==========');
      this.loader = false;
    },

    async getUserDetailInfo() {
      console.log('=== GET USER DETAIL DATA ===');
      this.loader = true;
      if (this.userIndex >= this.userItems.length) {
        alert('index error');
        return;
      }
      const userData = Object.assign({}, this.userItems[this.userIndex].user);
      userData.phoneNo = this.$common.convertPhoneString(userData.phoneNo);
      this.userData = userData;
      if (userData.role === 'STUDENT') {
        const search = { userId: userData.userId };
        const response = await this.$http.post('course/selUserCourseList', search);
        const data = response.data;
        if (data.result) {
          this.courseList = data.model;
          if (this.courseList.length > 0) {
            this.selectedCourse = this.courseList[0];
          }
        } else {
          alert('조회 오류 Param: ', search);
        }
      }

      console.log('========== END ==========');
      this.loader = false;
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
      updItem.userId = userItem.userId;

      const response = await this.$http.post('user/updUser', { user: updItem });
      if (response.data.result) {
        alert('사용자 정보가 수정되었습니다.');
        this.isEditMode = false;
        this.userData.modDt = Date();
        // this.getUserDetailInfo(); // 다시 불러올 필요가 있는가?
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
        alert('비밀번호 초기화는 사용자의 폰번호 뒤 4자리로 입력됩니다.\n휴대폰 번호를 정확하게 입력하세요.');
        return;
      }
      const confirmFlag = confirm(`${this.userData.name} 님의 비밀번호를 '${password}' 로 초기화 하시겠습니까?`);
      if (!confirmFlag) {
        return;
      }

      const response = await this.$http.post('user/updUser', { user: { userId: this.userData.userId, password }});
      if (response.data.result) {
        alert('비밀번호가 초기화되었습니다. 사용자에게 확인 바랍니다.');
      } else {
        alert('비밀번호 초기화가 실패하였습니다.\n관리자에게 문의 바랍니다.');
      }
    },

    moveUserIndex(value) {
      const nextIndex = this.userIndex + value
      this.$router.push({ name: '수강생 상세', params: { role: this.role, userIndex: nextIndex }});
    },

    async checkRoleChangeAlert(val) {
      if (this.roleCodeList.length === 0) {
        this.roleCodeList = this.groupDetailList('ROLE', null, this.userRole);
      }
      if (val) {
        alert('사용자 유형 변경은 실수로 등록했을 때만 사용하길 권장합니다.');
      }
    },

    showCourseDialog() {
      this.courseDialog = true;
      this.courseEditItem = Object.assign({}, this.courseDefaultItem);
      if (this.$refs.courseForm) {
        this.$refs.courseForm.resetValidation();
      }
    },

    closeCourseDialog() {
      this.courseDialog = false;
      this.courseEditItem = Object.assign({}, this.courseDefaultItem);
    },

    async insCourse() {
      const user = this.userData;
      let sendNewItem = JSON.parse(JSON.stringify(this.courseEditItem));

      const data = await this.$http.post('/course/insCourse', { course: sendNewItem });
      if (!data.data.result) {
        alert(data.data.message); // 이런 알림의 경우는 alert 로 한다.
        return;
      } else {
        this.showSnackbar(data.data.message);
        this.closeCourseDialog();
      }
    },

    selectCourse(course) {
      this.selectedCourse = course;
      this.selectedCourseId = course.courseId;
    },

    editCourseDialog(course, index) {
      this.selectedCourse(course);
    },

    selectLessonRecord(lessonRecord) {
      this.selectedLessonRecord = lessonRecord;
      this.selectedLrId = lessonRecord.lrId;
    },

    showSnackbar(text) {
      this.snackbarText = text;
      this.snackbarItem = true;
    },

  },

  computed: {
    ...mapGetters(['academyId', 'branchId', 'userRole', 'detailCodeName', 'detailCodeObject', 'groupDetailList', 'userList']),

    selectedCourseInLessonList() {
      if (!this.selectedCourse) {
        return [];
      }
      const courseId = this.selectedCourse.courseId;
      let fitems = this.lessonRecordList.filter(item => {
        return item.courseId === courseId;
      });
      return fitems;
    }
  },

  watch: {
    '$route.params.userIndex'(to, from) {
      console.log(`this.$route.params.userIndex :: to-${to}, from-${from}`);
      this.userIndex = to;
      this.getUserDetailInfo();
    },
  },

};
</script>
