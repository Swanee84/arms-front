<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-row>
      <v-col>
        <v-card class="mb-3">
          <v-toolbar flat dense>
            <v-toolbar-title>{{ detailCodeName[search.role] }} 수강 목록</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn outlined @click="newUserDialog()" class="mx-4"> <v-icon>note_add</v-icon>{{ detailCodeName[search.role] }} 추가</v-btn>
            <v-btn outlined :loading="loader" @click="getTablesData()"> <v-icon>search</v-icon>조회하기</v-btn>
          </v-toolbar>
          <v-toolbar-items>
            <v-row dense class="pl-4 pr-4">
              <v-col md="4" cols="4">
                <v-text-field dense prepend-icon="email" v-model="search.email" label="이메일로 검색" @keyup.native.enter="getTablesData" />
              </v-col>
              <v-col md="4" cols="4">
                <v-text-field dense prepend-icon="person" v-model="search.name" label="이름으로 검색" @keyup.native.enter="getTablesData" />
              </v-col>
              <v-col md="4" cols="4">
                <v-text-field dense prepend-icon="phone_iphone" v-model="search.phoneNo" label="핸드폰번호 검색" @keyup.native.enter="getTablesData" />
              </v-col>
            </v-row>
          </v-toolbar-items>
        </v-card>
        <v-card>
          <v-data-table :headers="headers" :items="items" :page.sync="page" :items-per-page="itemsPerPage" @page-count="pageCount = $event" :items-per-page-options="[10, 20, 50, -1]">
            <template v-slot:progress>
              <v-progress-linear color="green accent-1" :height="4" indeterminate></v-progress-linear>
            </template>
            <template v-slot:item="{ item, index }">
              <tr @click="selectUserDetail(item)">
                <td class="text-center">{{ index + 1 }}</td>
                <td v-if="isSuperUser" class="text-center">{{ item.branch.name }}</td>
                <td>{{ item.user.email }}</td>
                <td>{{ item.user.name }}</td>
                <td class="text-center">{{ $common.convertPhoneString(item.user.phoneNo) }}</td>
                <td class="text-center">{{ item.user.birthday }}</td>
                <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center">{{ $moment(item.user.regDt).format('YYYY-MM-DD HH:mm') }}</td>
              </tr>
            </template>
          </v-data-table>
          <div class="text-xs-center pt-2">
            <v-pagination ref="listpage" v-model="page" :length="pageCount" :total-visible="9"></v-pagination>
          </div>
        </v-card>
      </v-col>
      <v-dialog persistent v-model="editDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ detailCodeName[search.role] }} 등록</span>
          </v-card-title>
          <v-form ref="inputForm" lazy-validation>
            <v-card-text>
              <v-container>
                <v-row dense>
                  <v-col cols="12" sm="6" md="6">
                    <v-select v-model="editedItem.branchItem" :readonly="isBranchSelectReadonly" :items="branchList" label="지점 선택" item-text="name" item-value="branchId" return-object />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="editedItem.email" hint="palettenu@naver.com" persistent-hint label="로그인용 Email" :rules="$rules.optionalEmailRules" />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="editedItem.name" label="이름" :rules="$rules.requireRules" />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="editedItem.phoneNo" v-mask="mask.phoneNoMask" hint="010-1111-2222" persistent-hint label="전화번호" :rules="$rules.phoneRules" @blur="phoneNoInput" />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="editedItem.password" password hint="기본값: 폰번호 뒤 4자리" persistent-hint label="비밀번호" :rules="$rules.passWordRules" />
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-menu v-model="birthDatePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="editedItem.birthday" label="생년월일" v-mask="mask.dateMask" prepend-icon="event" @click:prepend="birthDatePicker = true" hint="날짜 선택 또는 직접입력(ex: 2002-01-01)" persistent-hint :rules="$rules.dateRules" @keyup.native.enter="insUser" />
                      </template>
                      <v-date-picker v-model="editedItem.birthday" @input="birthDatePicker = false" />
                    </v-menu>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-btn color="warning" outlined @click.native="dialogClose()">취소</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click.native="insUser()">등록</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar v-model="snackbarItem" top color="error"> {{ snackbarText }} <v-btn color="" outlined @click="snackbarItem = false">닫기</v-btn> </v-snackbar>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { mask } from 'vue-the-mask';

const totalObj = { dtlCd: null, dtlCdName: '전체' };
const selectObj = { dtlCd: null, dtlCdName: '선택' };

export default {
  data() {
    return {
      loader: true,

      page: 1,
      pageCount: 0,
      itemsPerPage: 10,

      mask: {
        dateMask: '####-##-##',
        phoneNoMask: '###-####-####',
      },

      birthDatePicker: false,
      search: {
        academyId: 1,
        branchId: 1,
        role: null,
        email: null,
        name: null,
        phoneNo: null,
      },

      headers: [
        { text: '순번', value: '', align: 'center' },
        { text: '소속지점', value: 'branch.name', align: 'center' },
        { text: 'Email', value: 'user.email', align: 'left' },
        { text: '이름', value: 'user.name', align: 'left' },
        { text: '휴대폰번호', value: 'user.phoneNo', align: 'center' },
        { text: '생일', value: 'user.birthday', align: 'center' },
        { text: '사용자 유형', value: 'user.role', align: 'center' },
        { text: '사용자 상태', value: 'user.status', align: 'center' },
        { text: '등록일시', value: 'user.regDt', align: 'center' },
      ],
      items: [],
      branchList: [],

      editDialog: false,
      editedItem: {},
      defaultItem: {
        branchItem: {},
        email: '',
        name: '',
        phoneNo: '',
        birthday: '',
        role: '',
        status: '',
      },
      originItem: {},
      // detailCodeName: {},

      snackbarItem: false,
      snackbarText: '',

      // userRole: '',
      isBranchSelectReadonly: false,
    };
  },

  components: {},

  directives: {
    mask,
  },

  beforeMount() {
    console.log(`beforeMount this.page : [${this.page}], this.$route`, this.$route);
    // this.setSearchRoleFromPath();
    // this.search.role = this.$route.params.role.toUpperCase();
    // this.itemsPerPage = this.$common.getPagePerListCount();

    // this.getInitData();
    // var queryObj = {}
    // queryObj.pagenumber = parseInt(this.$route.query.pagenumber) || 1
    // this.$router.push({ path: 'driver', query: queryObj })
  },

  mounted() {
    console.log(`mounted this.$route`, this.$route);
    // this.itemsPerPage = parseInt(localStorage.itemsPerPage) || 10
    // this.getUserInfo();
  },

  beforeUpdate() {
    // console.log(`beforeUpdate this.$route`, this.$route);
  },

  updated() {
    // console.log(`updated this.$route`, this.$route);
    // console.log(`updated : this.$route.query.pagenumber : [${this.$route.query.pagenumber}], this.page : [${this.page}]`)
    // var queryObj = {}
    // const currentPage = parseInt(this.$route.query.pagenumber) || 1
    // if (this.page !== currentPage) {
    //   queryObj.pagenumber = this.page
    // }
    // if (queryObj.pagenumber) {
    //   this.$router.push({ query: queryObj })
    // }
  },

  methods: {
    async getInitData() {
      this.getTablesData();
    },

    async getTablesData() {
      console.log('=== GET USER LIST DATA ===');
      this.loader = true;

      let search = this.search;
      const response = await this.$http.post('user/selUserList', search);
      if (response.data.result) {
        this.items = response.data.model;
      } else {
        alert('조회 오류 Param: ', search);
      }

      console.log('========== END ==========');
      const page = parseInt(this.$route.query.pagenumber) || 1;
      this.page = page;
      this.loader = false;
    },

    selectUserDetail(item) {
      // this.$router.push({ path: `/user_detail/${item.user.role}/${item.user.userId}` });
      this.$router.push({ name: '수강생 상세', params: { role: item.user.role, userId: item.user.userId } });
    },

    async newUserDialog() {
      this.editDialog = true;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedItem.role = this.search.role;

      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation();
      }
      if (this.branchList.length === 0) {
        const response = await this.$http.post('admin/selBranchList', { academyId: 1 });
        if (response.data.result) {
          this.branchList = response.data.model;
          this.isBranchSelectReadonly = this.branchList.length === 1; // 지점이 1개이면 강제선택
        }
      }
      this.editedItem.branchItem = this.branchList.length > 0 ? this.branchList[0] : {};
    },

    dialogClose() {
      this.editDialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
    },

    async insUser() {
      if (!this.$refs.inputForm.validate()) {
        this.showSnackbar('필수 항목을 입력해 주세요.');
        return;
      }
      let sendNewItem = JSON.parse(JSON.stringify(this.editedItem)); // deep copy 한줄로 끝낼 이것보다 좋은 방법 없나??
      if (!sendNewItem.birthday) {
        delete sendNewItem.birthday;
      }
      let branchItem = this.editedItem.branchItem;
      sendNewItem.phoneNo = this.removeDashPhoneNo(sendNewItem.phoneNo);

      const data = await this.$http.post('/user/insUser', { user: sendNewItem, branch: branchItem });
      if (!data.data.result) {
        alert(data.data.message); // 이런 알림의 경우는 alert 로 한다.
        return;
      } else {
        this.showSnackbar(data.data.message);
        this.getTablesData();
        this.dialogClose();
      }
    },

    showSnackbar(text) {
      this.snackbarText = text;
      this.snackbarItem = true;
    },

    historyUrl() {
      var queryObj = {};
      const currentPage = parseInt(this.$route.query.pagenumber) || 1;

      if (this.page > 0) {
        queryObj.pagenumber = this.page;
      } else if (this.page == 0 && currentPage == 1) {
        queryObj.pagenumber = currentPage;
      }
      if (this.search.drvNm) {
        queryObj.drvNm = this.search.drvNm;
      }

      if (queryObj.pagenumber || queryObj.drvNm) {
        this.$router.push({ path: 'driver', query: queryObj });
      }
    },
  },

  computed: {
    ...mapGetters(['academyId', 'branchId', 'userRole', 'isSuperUser', 'detailCodeName', 'detailCodeObject', 'groupDetailList']),
  },

  watch: {
    '$route.query.pagenumber'(to, from) {
      // 경로 변경에 반응하여...
      console.log(`[pagenumber] to : ${to}, from : ${from}`);
      const nextPage = to || 1;
      if (parseInt(this.page) !== parseInt(nextPage)) {
        console.log(`watch.pagenumber : [${nextPage}]`);
        this.page = parseInt(nextPage);
      }
    },

    page(to, from) {
      console.log(`[page] to : ${to}, from : ${from}`);
      if (to > 0) {
        this.historyUrl();
      }
    },
  },
};
</script>
