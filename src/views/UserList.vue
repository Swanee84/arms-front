<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-layout row wrap>
      <v-flex>
        <v-card class="mb-3">
          <v-toolbar flat dense>
            <v-toolbar-title>수강생</v-toolbar-title>
            <v-spacer></v-spacer>
            <label class="mx-4"> 건수 : {{ items.length }}</label>
            <v-btn outlined @click="newUserDialog()" class="mx-4">
              <v-icon>note_add</v-icon> 수강생 추가
            </v-btn>
            <v-btn outlined :loading="loader" @click="getListData()">
              <v-icon>search</v-icon> 조회하기
            </v-btn>
          </v-toolbar>
          <v-toolbar-items>
            <v-row dense class="pl-4 pr-4">
              <v-col md="4" sm="4">
                <v-text-field dense prepend-icon="email" v-model="search.email" label="이메일로 검색" @keyup.native.enter="getTablesData" />
              </v-col>
              <v-col md="4" sm="4">
                <v-text-field dense prepend-icon="person" v-model="search.name" label="이름으로 검색" @keyup.native.enter="getTablesData" />
              </v-col>
              <v-col md="4" sm="4">
                <v-text-field dense prepend-icon="phone_iphone" v-model="search.phoneNo" label="핸드폰번호 검색" @keyup.native.enter="getTablesData" />
              </v-col>
            </v-row>
          </v-toolbar-items>
        </v-card>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="items"
            
            :page.sync="page"
            :items-per-page="itemsPerPage"
            @page-count="pageCount = $event"

            :items-per-page-options='[10, 20, 50,-1]'
          >
            <template v-slot:progress>
              <v-progress-linear color="green accent-1" :height="4" indeterminate></v-progress-linear>
            </template>
            <template v-slot:item="{ item, index }">
              <tr @click="selectUserDetail(item)">
                <td>{{ index + 1 }}</td>
                <td>{{ item.branch.name }}</td>
                <td>{{ item.user.email }}</td>
                <td>{{ item.user.name }}</td>
                <td>{{ $common.convertPhoneString(item.user.phoneNo) }}</td>
                <td>{{ item.user.birthday }}</td>
                <td>
                  <v-chip small :color="userBadgeColor(item.user.role)" >{{ detailCodeName[item.role] }}</v-chip>
                </td>
                <td>
                  <v-chip small :color="userBadgeColor(item.user.status)" >{{ detailCodeName[item.status] }}</v-chip>
                </td>
                <td>{{ $moment(item.user.regDt).format('YYYY-MM-DD HH:mm') }}</td>
              </tr>
            </template>
          </v-data-table>
          <div class="text-xs-center pt-2">
            <v-pagination ref="listpage" v-model="page" :length="pageCount" :total-visible="9"></v-pagination>
          </div>
        </v-card>
      </v-flex>
      <!-- <v-dialog persistent v-model="editDialog" max-width="46%">
        <v-card>
          <v-card-title>
            <span class="headline">{{ dialogTitle }}</span>
          </v-card-title>

          <v-form ref="inputForm" lazy-validation>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex md6>
                    <v-text-field v-model="editItem.drvId" label="자격번호" required :rules="rules.requireRules"></v-text-field>
                  </v-flex>
                  <v-flex md6>
                    <v-text-field v-model="editItem.corpRegNo" label="사업자번호"></v-text-field>
                  </v-flex>
                  <v-flex md3>
                    <v-text-field v-model="editItem.drvNm" label="이름" :rules="rules.requireRules"></v-text-field>
                  </v-flex>
                  <v-flex md3>
                    <v-select dense v-model="editItem.status" :rules="rules.requireRules" :items="drvStatusSelectList" item-text="dtlCdNm" item-value="dtlCd" label="상태"></v-select>
                  </v-flex>
                  <v-flex md3>
                    <v-select dense v-model="editItem.agent" :items="agentSelectList" item-text="dtlCdNm" item-value="dtlCd" label="소속"></v-select>
                  </v-flex>
                  <v-flex md3>
                    <v-select dense v-model="editItem.flag" :items="flagSelectList" item-text="dtlCdNm" item-value="dtlCd" label="부제"></v-select>
                  </v-flex>
                  <v-flex md3>
                    <v-select dense v-model="editItem.cardinalNo" :items="cardinalSelectList" item-text="dtlCdNm" item-value="dtlCd" label="기수"></v-select>
                  </v-flex>
                  <v-flex md3>
                    <v-select dense v-model="editItem.carType" :items="carTypeSelectList" item-text="dtlCdNm" item-value="dtlCd" label="차량유형"></v-select>
                  </v-flex>
                  <v-flex md3>
                    <v-select dense v-model="editItem.carModel" :items="carModelSelectList" item-text="dtlCdNm" item-value="dtlCd" label="차종"></v-select>
                  </v-flex>
                  <v-flex md3>
                    <v-text-field v-model="editItem.carNo" label="차량번호"></v-text-field>
                  </v-flex>
                  <v-flex md3>
                    <v-menu v-model="picker.datePicker" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width>
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="editItem.expDateFrom" label="유효기간 시작일" placeholder="날짜를 선택해주세요" v-mask="mask.dateMask" :rules="rules.dateRules" prepend-icon="event" @click:prepend="picker.datePicker = true" hint="YYYY-MM-DD (ex: 2019-04-09)" />
                      </template>
                      <v-date-picker v-model="editItem.expDateFrom" @input="picker.datePicker = false" show-current></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex md3>
                    <v-menu v-model="picker.datePicker2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width>
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="editItem.expDateTo" label="유효기간 종료일" placeholder="날짜를 선택해주세요" v-mask="mask.dateMask" :rules="rules.dateRules" prepend-icon="event" @click:prepend="picker.datePicker2 = true" hint="YYYY-MM-DD (ex: 2019-04-09)" />
                      </template>
                      <v-date-picker v-model="editItem.expDateTo" @input="picker.datePicker2 = false" show-current></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex md3>
                    <v-text-field v-model="editItem.uberCd" label="우버코드"></v-text-field>
                  </v-flex>
                  <v-flex md3>
                    <v-text-field v-model="editItem.nUberCd" label="신규우버코드"></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <h2>개인정보</h2>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.email" label="메일"></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.mobileNo" label="핸드폰"></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.birthDate" label="생년월일"></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.bankCd" label="은행"></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.accNo" label="계좌번호"></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <v-text-field v-model="editItem.addr" label="주소"></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <h2>언어정보</h2>
                  </v-flex>
                  <v-flex md4>
                    <v-select dense v-model="editItem.engLevel" :items="levelSelectList" item-text="dtlCdNm" item-value="dtlCd" label="영어등급"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-select dense v-model="editItem.jpnLevel" :items="levelSelectList" item-text="dtlCdNm" item-value="dtlCd" label="일어등급"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-select dense v-model="editItem.chnLevel" :items="levelSelectList" item-text="dtlCdNm" item-value="dtlCd" label="중국어등급"></v-select>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-btn color="error" outlined @click.native="deleteDriver()" v-if="divTitle == 'U'">삭제</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="green" outlined @click.native="resetPassword()">비밀번호 초기화</v-btn>
            <v-btn color="warning" outlined @click.native="dialogClose()">취소</v-btn>
            <v-btn color="primary" outlined @click.native="saveDriver()" v-if="divTitle == 'C'">등록</v-btn>
            <v-btn color="primary" outlined @click.native="updateDriver()" v-if="divTitle == 'U'">수정</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog> -->
      <v-snackbar v-model="snackbarItem" top color="error">
        {{ snackbarText }} <v-btn color="" outlined @click="snackbarItem = false">닫기</v-btn>
      </v-snackbar>
    </v-layout>
  </v-container>
</template>

<script>
import { mask } from 'vue-the-mask'

const totalObj = { dtlCd: null, dtlCdNm: '전체' }
const selectObj = { dtlCd: null, dtlCdNm: '선택' }

export default {
  data () {
    return {
      loader: true,
      
      page: 1,
      pageCount: 0,
      itemsPerPage: common.getPagePerListCount(),
      
      mask: {
        dateMask: '####-##-##',
      },

      picker: {
        datePicker: false,
        datePicker2: false,
      },
      search: {
        drvNm: null,
        mobileNo: null,
        carNo: null,
        agent: null,
        cardinalNo: null,
        language: null,
        level: null,
        status: 'DRVS004',
        engLevel: null,
        jpnLevel: null,
        chnLevel: null,
        carType: null,
      },

      headers: [
        { text: '소속지점', value: 'branch.name', align: 'center' },
        { text: 'Email', value: 'user.email', align: 'left' },
        { text: '이름', value: 'user.name', align: 'left' },
        { text: '휴대폰번호', value: 'user.phoneNo', align: 'center' },
        { text: '생일', value: 'user.birthday', align: 'center' },
        { text: '사용자 유형', value: 'user.role', align: 'center' },
        { text: '등록일시', value: 'user.regDt', align: 'center' },
      ],
      items: [],
      agentSelectList: [],
      cardinalSelectList: [],
      levelSelectList: [],
      langSelectList: [],
      levelSelectList2: [],
      flagSelectList: [],
      carTypeSelectList: [],
      carModelSelectList: [],
      divSelectList: [],
      driverList: [],
      tempList: [],
      drvStatusSelectList: [],

      editDialog: false,
      editItem: {
        
      },
      defaultItem: {
        entDiv: '',
        drvId: '',
        verNo: 0,
      },
      originItem: {},
      detailCodeName: common.detailCodeName,
      date: this.$moment(new Date()).format('YYYY-MM-DD'),
      menu2: false,

      snackbarItem: false,
      snackbarText: '',
    }
  },

  components: {
    LanguageChip,
  },

  directives: {
    mask,
  },

  beforeMount () {
    console.log('<<< [Pristin] User-Song List >>>')
    this.editItem = Object.assign({}, this.defaultItem)
    this.getInitData()
    var queryObj = {}
    queryObj.pagenumber = parseInt(this.$route.query.pagenumber) || 1
    this.$router.push({ path: 'driver', query: queryObj })
    
  },

  mounted () {
    this.itemsPerPage = parseInt(localStorage.itemsPerPage) || 10
  },

  beforeUpdate () {
    console.log(`beforeUpdate : this.$route.query.pagenumber : [${this.$route.query.pagenumber}], this.page : [${this.page}]`)
  },

  updated () {
    console.log(`updated : this.$route.query.pagenumber : [${this.$route.query.pagenumber}], this.page : [${this.page}]`)
    var queryObj = {}
    const currentPage = parseInt(this.$route.query.pagenumber) || 1
    if (this.page !== currentPage) {
      queryObj.pagenumber = this.page
    }
    if (queryObj.pagenumber) {
      this.$router.push({ query: queryObj })
    }
  },

  methods: {
    async getTablesData () {
      console.log('=== GET SONG LIST DATA ===')
      this.loader = true
      
      let sendNewItem = this.search
      const response = await this.$http.get('user/selDriverList',{params: sendNewItem})
      const articleList = response.data.articleList
      
      this.items = articleList
      
      console.log('========== END ==========')
      const page = parseInt(this.$route.query.pagenumber) || 1
      this.page = page
      this.loader = false
    },

    async getInitData() {
      this.detailCodeName = await common.getDetailCodeName()
      let groupCode = await common.getCodeGroupList(['AGENT', 'CARDINAL_NO', 'LANGUAGE', 'LEVEL', 'DRV_STATUS', 'FLAG', 'CAR_TYPE', 'CAR_MODEL']) // <= 여러 개 불러올 때
      
      this.agentSelectList = await common.getGroupDetailList('AGENT') // array 에 추가/삭제등이 있을 경우는 await common.getGroupDetailList 을 이용한다.
      this.langSelectList = await common.getGroupDetailList('LANGUAGE') // deep copy 가 필요하지 않다면 .slice() 로 새로운 배열을 만드는것으로 충분하다.
      this.levelSelectList = await common.getGroupDetailList('LEVEL') // groupCode 의 detailList 를 가져와 그 배열에 가공을 하게 되면 groupCode 의 detailList 도 같이 변경된다.
      this.drvStatusSelectList = await common.getGroupDetailList('DRV_STATUS') // 의외로 javascript 가 call by reference 임을 생각한다.
      this.flagSelectList = await common.getGroupDetailList('FLAG')
      this.carTypeSelectList = await common.getGroupDetailList('CAR_TYPE')
      this.carModelSelectList = await common.getGroupDetailList('CAR_MODEL')

      this.agentSelectList.unshift(totalObj)
      this.drvStatusSelectList.unshift(totalObj)
      this.levelSelectList.unshift(totalObj)
      this.langSelectList.unshift(totalObj)
      this.flagSelectList.unshift(selectObj)
      this.carTypeSelectList.unshift(selectObj)
      this.carModelSelectList.unshift(selectObj)
      
      for (var i=1; i < 22; i++) {
        this.cardinalSelectList.push({ dtlCd: i, dtlCdNm: i + '기' })
      }
      this.cardinalSelectList.unshift(totalObj)

      this.getTablesData() 
    },

    async getDriverData() {
      const response = await this.$http.get('user/selSelectDriverList', { status: '출근' })
      this.driverList = response.data
    },

    selectDriverDetail(item) {
      this.editDialog = true
      
      this.editItem = Object.assign({}, item)
      console.log(this.testId)
      this.editItem.driver = this.driverList.find(o => o.drvId === item.drvId)
      this.originItem = Object.assign({}, item)
      this.divTitle = 'U'

      this.editItem.mobileNo = common.convertPhoneString(this.editItem.mobileNo)

      this.levelSelectList.shift(totalObj)
      this.levelSelectList.unshift(selectObj)
      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation()
      }
    },

    newDriverDialog() {
      this.editDialog = true
      this.editItem = Object.assign({}, this.defaultItem)
      this.divTitle = 'C'

      this.levelSelectList.shift(totalObj)
      this.levelSelectList.unshift(selectObj)
      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation()
      }
    },

    async updateDriver () {
      if (!this.$refs.inputForm.validate()) {
        this.showSnackbar('필수 항목을 입력해 주세요.') // alert 와 snackbar 를 이용하는 경우는 무엇일까? 화면에 lock 을 걸어야 하는 경우와 아닌경우로 생각해 보면 될 것이다.
        return // 화면에 lock 을 거는 경우는 레이어로 팝업을 올리는 경우와(대부분의 광고) dialog 처럼 modal 인 경우가 있을 텐데 안내 메세지를 표시하는 경우 어떻게 사용할지 고민해본다.
      }

      const confirmFlag = confirm(`회원정보를 변경하시겠습니까?`)
      if (!confirmFlag) {
        return
      }

      let sendItem = {}

      let drvId = this.editItem.drvId
      let drvNm = this.editItem.drvNm
      let drvStatus = this.editItem.status
      let mobileNo = this.editItem.mobileNo
      // if (!drvId || !drvNm ||!drvStatus) { // inputForm.validate() 의 rules 에서 이미 걸러진다.
      //   alert('필수 항목을 입력해 주세요.')
      //   return
      // }
      if(mobileNo!=''){
        this.editItem.mobileNo = this.removeDashPhoneNo(this.editItem.mobileNo)
      }
      
      const data = await this.$http.post("/user/updDriver", this.editItem)
      this.getTablesData()
      this.dialogClose()
    },

    async deleteDriver () {
      const confirmFlag = confirm(`회원을 삭제하시겠습니까?`)
      if (!confirmFlag) {
        return
      }

      let sendItem = {} // 객체에 변화가 없을 경우 let sendItem = { drvId: this.editItem.drvId, verNo: this.editItem.verNo } 로 해도 되겠지만 이건 개인취향으로 가자.

      sendItem.drvId = this.editItem.drvId
      sendItem.verNo = this.editItem.verNo
      
      const data = await this.$http.post("/user/delDriver", sendItem)
      this.getTablesData()
      this.dialogClose()
    },

    dialogClose () {
      this.editDialog = false
      this.editItem = Object.assign({}, this.defaultItem)

      this.levelSelectList.shift(selectObj)
      this.levelSelectList.unshift(totalObj)
    },

    async resetPassword(){
      this.editItem.resetPassword = '$2a$10$.tayLxPa8Qi2OE1ZZMPjsepCPjCtS/4Vgbe0bkNHJfVP123yNTmxe';
      console.log(this.editItem);
      const data = await this.$http.post("/user/updDriver", this.editItem);
      this.dialogClose()
    },

    async saveDriver () {
      if (!this.$refs.inputForm.validate()) {
        this.showSnackbar('필수 항목을 입력해 주세요.')
        return
      }

      let drvId = this.editItem.drvId
      let drvNm = this.editItem.drvNm
      let drvStatus = this.editItem.status
      let expDateFrom = this.editItem.expDateFrom
      let expDateTo = this.editItem.expDateTo
      let mobileNo = this.editItem.mobileNo

      if(mobileNo!=null){
        this.editItem.mobileNo = this.removeDashPhoneNo(this.editItem.mobileNo)
      }
      
      // if (!drvId || !drvNm ||!drvStatus) { // v-form 을 사용하면 validate() 를 이용한다.
      //   alert('필수 항목을 입력해 주세요.')
      //   return
      // }
      
      let sendNewItem = this.editItem
      const data = await this.$http.post("/user/insDriver", sendNewItem)
      if (!data.data.result) {
        if (data.data.message == 'DUPLICATE CODE') {
          alert('이미 등록된 자격번호 입니다.') // 이런 알림의 경우는 alert 로 한다.
          return
        }
      } else {
        this.getTablesData()
        this.dialogClose()
      }
    },

    showSnackbar (text) {
      this.snackbarText = text
      this.snackbarItem = true
    },

    historyUrl () {
      var queryObj = {}
      const currentPage = parseInt(this.$route.query.pagenumber) || 1
      
      if (this.page > 0) {
        queryObj.pagenumber = this.page
      } else if (this.page == 0 && currentPage == 1) {
        queryObj.pagenumber = currentPage
      }
      if (this.search.drvNm) {
        queryObj.drvNm = this.search.drvNm
      }
      
      if (queryObj.pagenumber || queryObj.drvNm) {
        this.$router.push({ path: 'driver', query: queryObj })
      }
    },

    removeDashPhoneNo(num) {
      var newNum
      newNum = num.replace(/[^0-9]/g, '')
      return newNum
    },

    userBadgeColor (value) {
      if (status == 'USER001') {
        return 'cyan darken-1'
      } else if (status == 'USER002') {
        return 'red darken-1'
      } else if (status == 'TEACHER') {
        return 'purple darken-1'
      } else if (status == 'STUDENT') {
        return 'yellow darken-2'
      } else if (status == 'BRANCH') {
        return 'orange darken-3'
      } else if (status == 'ACADEMY') {
        return 'deep-orange darken-3'
      } else {
        return 'indigo darken-1'
      }
    },

  },

  computed: {
    dialogTitle () {
      return this.divTitle == 'C'? '회원 등록' : '회원 수정'
    }
  },

  watch: {
    '$route.query.pagenumber' (to, from) {
      // 경로 변경에 반응하여...
      console.log(`[pagenumber] to : ${to}, from : ${from}`)
      const nextPage = to || 1
      if (parseInt(this.page) !== parseInt(nextPage)) {
        console.log(`watch.pagenumber : [${nextPage}]`)
        this.page = parseInt(nextPage)
      }
    },

    page (to, from) {
      console.log(`[page] to : ${to}, from : ${from}`)
      if (to > 0) {
        this.historyUrl()
      }
    },
  }
}
</script>
