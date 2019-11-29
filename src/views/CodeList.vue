<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-row v-if="groupCodeList != null">
      <v-col sm="6" xs="12" cols="12">
        <v-card>
          <v-toolbar color="teal" dark>
            <v-toolbar-title>그룹코드 목록 </v-toolbar-title>
            <v-divider vertical inset class="mx-4" />
            <v-text-field v-model="searchGrpCd" flat hide-details prepend-inner-icon="search" color="white" label="그룹코드 또는 코드명 검색"></v-text-field>
            <v-spacer></v-spacer>
            <v-btn icon @click="newGroupCodeDialog()">
              <v-icon>playlist_add</v-icon>
            </v-btn>
          </v-toolbar>
          <v-list two-line style="height:calc(100vh - 212px)" class="overflow-y-auto">
            <template v-for="(item, index) in filteredItems">
              <v-list-item :key="item.grpCd" @click="selectGroupCode(item)" @mouseover="showByGroupIndex = index" @mouseleave="showByGroupIndex = null">
                <v-list-item-avatar color="teal darken-3">
                  <span>{{ index + 1 }}</span>
                </v-list-item-avatar>
                <v-list-item-action>
                  <v-icon v-if="selectedGroup === item.grpCd">check</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>[ {{ item.grpCd }} ]</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.grpCdName }}<br />
                    {{ detailCodeName[item.status] }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon ripple v-if="showByGroupIndex === index" @click="editGroupCodeDialog(item, index)">
                    <v-icon color="grey lighten-1">edit</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-divider v-if="index < groupCodeList.length - 1" :key="'divider_' + item.grpCd"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-col>
      <v-col sm="6" xs="12" cols="12">
        <v-card>
          <v-toolbar color="cyan" dark>
            <v-btn v-if="detailCodeList != null" color="cyan darken-2" :dark="false" @click.native="showReorderDialog()">
              <v-icon>reorder</v-icon>
              <v-icon>swap_vert</v-icon>Reorder
            </v-btn>
            <v-toolbar-title
              ><span v-if="detailCodeList != null">[ {{ selectedGroup }} : {{ selectedGroupName }} ] </span>상세코드 목록</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <v-btn v-if="detailCodeList != null" icon @click="newDetailCodeDialog()">
              <v-icon>playlist_add</v-icon>
            </v-btn>
          </v-toolbar>
          <v-list two-line style="height:calc(100vh - 212px)" class="overflow-y-auto">
            <template v-for="(item, index) in detailCodeList">
              <v-list-item :key="item.dtlCd" @click="editDetailCodeDialog(item, index)">
                <v-list-item-avatar color="cyan darken-3">
                  <span>{{ index + 1 }}</span>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>[ {{ item.dtlCd }} ] - {{ item.dtlCdName }}</v-list-item-title>
                  <v-list-item-subtitle>
                    VAL1: {{ ifNullText(item.val1) }}, VAL2: {{ ifNullText(item.val2) }}, VAL3: {{ ifNullText(item.val3) }}<br />
                    {{ detailCodeName[item.status] }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider v-if="index < detailCodeList.length - 1" :key="'divider_' + item.dtlCd"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-col>
      <v-dialog persistent v-model="reorderDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ reorderTitle }} Reorder</span>
            <v-spacer></v-spacer>
            <v-btn fab ripple small outlined color="deep-orange lighten-1" :disabled="selectedReorderIndex == null">
              <v-icon @click="itemOrder(-1)">arrow_upward</v-icon>
            </v-btn>
            <v-btn class="ml-2" fab ripple small outlined color="light-blue lighten-1" :disabled="selectedReorderIndex == null">
              <v-icon @click="itemOrder(1)">arrow_downward</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-list style="height:calc(100vh - 232px)" class="overflow-y-auto">
            <template v-for="(item, index) in reorderList">
              <v-list-item :key="'reorder_tile_' + item.dtlCd" @click="selectReorderItem(index)">
                <v-list-item-avatar :color="selectedReorderIndex === index ? 'cyan darken-3' : ''">
                  <v-icon v-if="selectedReorderIndex === index">check</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>[ {{ item.dtlCd }} ] - {{ item.dtlCdName }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider v-if="index < reorderList.length - 1" :key="'reorder_divider_' + item.dtlCd"></v-divider>
            </template>
          </v-list>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="primary" outlined @click="reorderClose()">Close</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="warning" outlined @click="reorderSave()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog persistent v-model="editGroupDialog" max-width="650px">
        <v-card>
          <v-card-title>
            <span class="headline">그룹 코드</span>
          </v-card-title>
          <v-form ref="inputForm1" lazy-validation>
            <v-card-text>
              <v-container grid-list-md>
                <v-row>
                  <v-col :sm="editedIndex > -1 ? 9 : 12">
                    <v-text-field v-model="editGroupCode.grpCd" :rules="$myrules.requireRules" label="Input group code" :readonly="editedIndex > -1 && !modifyGrpCd"></v-text-field>
                  </v-col>
                  <v-col v-if="editedIndex > -1" sm="3">
                    <v-checkbox v-model="modifyGrpCd" label="그룹코드 수정"></v-checkbox>
                  </v-col>
                  <v-col sm="12">
                    <v-text-field v-model="editGroupCode.grpCdName" :rules="$myrules.requireRules" label="Input group name"></v-text-field>
                  </v-col>
                  <v-col sm="12">
                    <v-radio-group v-model="editGroupCode.status" :rules="$myrules.requireRules" color="orange" row>
                      <template v-for="(item, index) in codeStatusList">
                        <v-radio v-if="item.dtlCd" :label="item.dtlCdName" :value="item.dtlCd" :key="'statusSelect_' + index" />
                      </template>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-btn color="warning" outlined @click.native="groupCodeDialogClose()">닫기</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click.native="saveGroupCode()">저장</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog persistent v-model="editDetailDialog" max-width="650px">
        <v-card>
          <v-card-title>
            <span class="headline">상세 코드</span>
          </v-card-title>
          <v-form ref="inputForm2" lazy-validation>
            <v-card-text>
              <v-container grid-list-md>
                <v-row>
                  <v-col md="12">
                    <v-text-field v-model="editDetailCode.grpCd" label="Group code" readonly></v-text-field>
                  </v-col>
                  <v-col md="12">
                    <v-text-field v-model="editDetailCode.dtlCd" label="Input detail code" :rules="$myrules.requireRules"></v-text-field>
                  </v-col>
                  <v-col md="12">
                    <v-text-field v-model="editDetailCode.dtlCdName" label="Input detail name" :rules="$myrules.requireRules"></v-text-field>
                  </v-col>
                  <v-col md="4">
                    <v-text-field v-model="editDetailCode.val1" label="Input VAL 1"></v-text-field>
                  </v-col>
                  <v-col md="4">
                    <v-text-field v-model="editDetailCode.val2" label="Input VAL 2"></v-text-field>
                  </v-col>
                  <v-col md="4">
                    <v-text-field v-model="editDetailCode.val3" label="Input VAL 3"></v-text-field>
                  </v-col>
                  <v-col md="12">
                    <v-radio-group v-model="editDetailCode.status" :rules="$myrules.requireRules" color="orange" row>
                      <template v-for="(item, index) in codeStatusList">
                        <v-radio v-if="item.dtlCd" :label="item.dtlCdName" :value="item.dtlCd" :key="'statusSelect_' + index" />
                      </template>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-btn color="warning" outlined @click.native="detailCodeDialogClose()">닫기</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click.native="saveDetailCode()">저장</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar v-model="snackbarItem" top color="error"> {{ snackbarText }} <v-btn color="" outlined @click="snackbarItem = false">닫기</v-btn> </v-snackbar>
    </v-row>
  </v-container>
</template>

<script>
// import rules from "../../plugins/rules"

export default {
  data: () => ({
    // rules,

    searchGrpCd: '',
    groupCodeList: null,
    detailCodeList: null,
    codeStatusList: null,
    detailCodeName: {},

    showByGroupIndex: null,

    selectedGroup: '',
    selectedGroupItem: {},
    selectedGroupName: '',
    selectedCode: '',
    selectedCodeName: '',

    editGroupDialog: false,
    editDetailDialog: false,
    defaultGroupCode: {
      grpCd: '',
      grpCdName: '',
      verNo: 0,
    },
    editGroupCode: {},
    defaultDetailCode: {
      grpCd: '',
      dtlCd: '',
      dtlCdName: '',
      val1: '',
      val2: '',
      val3: '',
      dtlOrder: 0,
      verNo: 0,
    },
    editDetailCode: {},
    editedIndex: -1,
    originItem: {},

    reorderDialog: false,
    reorderTitle: '',
    reorderList: [],
    selectedReorderIndex: null,

    snackbarItem: false,
    snackbarText: '',

    modifyGrpCd: false,
  }),

  beforeCreate() {
    this.detailCodeName = this.$mycommon.detailCodeName;
    this.editGroupCode = Object.assign({}, this.defaultGroupCode);
  },

  mounted() {
    this.selGroupCodeList();
    this.getStatusCodeList();
  },

  updated() {},

  methods: {
    async getStatusCodeList() {
      this.detailCodeName = await this.$mycommon.getDetailCodeName();
      this.codeStatusList = await this.$mycommon.getGroupDetailList('CODE');
    },
    async selGroupCodeList() {
      const response = await this.$http.post('/code/selGroupCodeList', { academyId: this.$mycommon.constAcademyId });
      this.groupCodeList = response.data.model;
    },

    async selDetailCodeList() {
      let grpId = this.selectedGroupItem.grpId;
      const response = await this.$http.post('/code/selDetailCodeList', { academyId: this.$mycommon.constAcademyId, grpId });
      let detailCodeList = response.data.model;
      return detailCodeList;
    },

    async selectGroupCode(item) {
      this.selectedGroup = item.grpCd;
      this.selectedGroupName = item.grpCdName;
      this.selectedGroupItem = item;
      let detailCodeList = item.detailCodeList;
      if (detailCodeList == null) {
        let codeList = await this.selDetailCodeList();
        this.detailCodeList = codeList;
        item.detailCodeList = codeList;
      } else {
        this.detailCodeList = detailCodeList;
      }
    },

    newGroupCodeDialog() {
      this.editGroupDialog = true;
      this.editedIndex = -1;
      this.modifyGrpCd = true;
      this.editGroupCode = Object.assign({}, this.defaultGroupCode);

      if (this.$refs.inputForm1) {
        this.$refs.inputForm1.resetValidation();
      }
    },

    editGroupCodeDialog(item, index) {
      this.editGroupDialog = true;
      this.editedIndex = index;
      this.editGroupCode = Object.assign({}, item);
      this.modifyGrpCd = false;
      // this.editGroupCode.newCd = item.grpCd
      this.originItem = Object.assign({}, item);

      if (this.$refs.inputForm1) {
        this.$refs.inputForm1.resetValidation();
      }
    },

    groupCodeDialogClose() {
      this.editGroupDialog = false;
      this.editGroupCode = Object.assign({}, this.defaultGroupCode);
    },

    newDetailCodeDialog() {
      this.editDetailDialog = true;
      this.editedIndex = -1;
      this.editDetailCode = Object.assign({}, this.defaultDetailCode);
      this.editDetailCode.grpId = this.selectedGroupItem.grpId;
      this.editDetailCode.grpCd = this.selectedGroup;
      this.editDetailCode.dtlCd = this.selectedGroup + '_';

      if (this.$refs.inputForm2) {
        this.$refs.inputForm2.resetValidation();
      }
    },

    editDetailCodeDialog(item, index) {
      this.editDetailDialog = true;
      this.editedIndex = index;
      this.editDetailCode = Object.assign({}, item);
      // this.editDetailCode.newCd = item.dtlCd
      this.originItem = Object.assign({}, item);

      if (this.$refs.inputForm2) {
        this.$refs.inputForm2.resetValidation();
      }
    },

    detailCodeDialogClose() {
      this.editDetailDialog = false;
      this.editDetailCode = Object.assign({}, this.defaultDetailCode);
    },

    showReorderDialog() {
      this.reorderDialog = true;
      this.reorderList = this.detailCodeList;
      this.reorderTitleString = `[ ${this.selectedGroup} : ${this.selectedGroupName} ]`;
    },

    selectReorderItem(index) {
      this.selectedReorderIndex = index;
    },

    itemOrder(value) {
      let index = this.selectedReorderIndex;
      let nextIndex = index + value;
      let tempList = JSON.parse(JSON.stringify(this.reorderList));
      if (nextIndex >= 0 && nextIndex < tempList.length) {
        let nItem = tempList[nextIndex];
        let mItem = tempList[index];
        tempList[index] = nItem;
        tempList[nextIndex] = mItem;
        this.reorderList = JSON.parse(JSON.stringify(tempList));
        this.selectedReorderIndex = nextIndex;
      }
    },

    async reorderSave() {
      this.detailCodeList = this.reorderList;
      let sendOrderingList = [];
      for (const i in this.reorderList) {
        const item = this.reorderList[i];
        const order = parseInt(i) + 1;
        item.dtlOrder = order;
        sendOrderingList.push({ grpId: item.grpId, dtlId: item.dtlId, dtlOrder: order });
      }
      const response = await this.$http.post('/code/updCodeOrdering', { academyId: this.$mycommon.constAcademyId, cdDtlList: sendOrderingList });
      this.selectedGroupItem.detailCodeList = this.detailCodeList;
      this.reorderClose();
    },

    reorderClose() {
      this.selectedReorderIndex = null;
      this.reorderDialog = false;
    },

    saveGroupCode() {
      if (!this.$refs.inputForm1.validate()) {
        this.showSnackbar('필수 항목을 입력해 주세요.');
        return;
      }

      if (this.editedIndex > -1) {
        // 수정하기
        this.updGroupCode();
      } else {
        // 등록하기
        this.insGroupCode();
      }
    },

    saveDetailCode() {
      if (!this.$refs.inputForm2.validate()) {
        this.showSnackbar('필수 항목을 입력해 주세요.');
        return;
      }

      if (this.editedIndex > -1) {
        // 수정하기
        this.updDetailCode();
      } else {
        // 등록하기
        this.insDetailCode();
      }
    },

    ifNullText(text) {
      return text ? text : ' ';
    },

    async insGroupCode() {
      const searchCode = this.editGroupCode.dtlCd;
      for (const item of this.groupCodeList) {
        if (item.grpCd == searchCode) {
          alert('이미 등록된 코드입니다.');
          return;
        }
      }
      let sendNewItem = this.editGroupCode;
      sendNewItem.academyId = this.$mycommon.constAcademyId;

      const response = await this.$http.post('/code/insGroupCode', { cdGrp: sendNewItem });
      if (response.data.result) {
        this.selGroupCodeList();
        this.groupCodeDialogClose();
      } else {
        alert('등록 실패');
      }
    },

    async updGroupCode() {
      let updateItem = {
        grpId: this.editGroupCode.grpId,
      };
      if (this.originItem.grpCd != this.editGroupCode.grpCd && this.editGroupCode.grpCd != '') {
        for (const item of this.groupCodeList) {
          if (item.grpCd == this.editGroupCode.grpCd) {
            alert('이미 등록된 코드입니다.');
            return;
          }
        }
        updateItem.grpCd = this.editGroupCode.grpCd;
      }
      if (this.originItem.grpCdName != this.editGroupCode.grpCdName) {
        updateItem.grpCdName = this.editGroupCode.grpCdName;
      }
      if (this.originItem.status != this.editGroupCode.status) {
        updateItem.status = this.editGroupCode.status;
      }

      const response = await this.$http.post('/code/updGroupCode', { cdGrp: updateItem });

      this.selGroupCodeList();
      this.groupCodeDialogClose();
    },

    async insDetailCode() {
      const searchCode = this.editDetailCode.dtlCd;
      for (const item of this.detailCodeList) {
        if (item.dtlCd == searchCode) {
          alert('이미 등록된 코드입니다.');
          return;
        }
      }
      let sendNewItem = this.editDetailCode;
      sendNewItem.academyId = this.$mycommon.constAcademyId;

      const response = await this.$http.post('/code/insDetailCode', { cdDtl: sendNewItem });
      if (response.data.result) {
        let codeList = await this.selDetailCodeList();
        this.detailCodeList = codeList;
        this.selectedGroupItem.detailCodeList = codeList;
        this.detailCodeDialogClose();
      } else {
        alert('등록 실패');
      }
    },

    async updDetailCode() {
      let updateItem = {
        grpId: this.editDetailCode.grpId,
        dtlId: this.editDetailCode.dtlId,
      };
      if (this.originItem.dtlCd != this.editDetailCode.dtlCd && this.editDetailCode.dtlCd != '') {
        for (const item of this.detailCodeList) {
          if (item.dtlCd == this.editDetailCode.dtlCd) {
            alert('이미 등록된 코드입니다.');
            return;
          }
        }
        updateItem.dtlCd = this.editDetailCode.dtlCd;
      }
      if (this.originItem.dtlCdName != this.editDetailCode.dtlCdName) {
        updateItem.dtlCdName = this.editDetailCode.dtlCdName;
      }
      if (this.originItem.val1 != this.editDetailCode.val1) {
        updateItem.val1 = this.editDetailCode.val1;
      }
      if (this.originItem.val2 != this.editDetailCode.val2) {
        updateItem.val2 = this.editDetailCode.val2;
      }
      if (this.originItem.val3 != this.editDetailCode.val3) {
        updateItem.val3 = this.editDetailCode.val3;
      }
      if (this.originItem.status != this.editDetailCode.status) {
        updateItem.status = this.editDetailCode.status;
      }

      const response = await this.$http.post('/code/updDetailCode', { cdDtl: updateItem });

      let codeList = await this.selDetailCodeList();
      this.detailCodeList = codeList;
      this.selectedGroupItem.detailCodeList = codeList;
      this.detailCodeDialogClose();
    },

    showSnackbar(text) {
      this.snackbarText = text;
      this.snackbarItem = true;
    },
  },

  computed: {
    filteredItems() {
      if (this.searchGrpCd) {
        let search = this.searchGrpCd.toUpperCase();
        let fitems = this.groupCodeList.filter(item => {
          return item.grpCd.indexOf(search) > -1 || item.grpCdName.indexOf(search) > -1;
        });
        return fitems;
      } else {
        return this.groupCodeList;
      }
    },
  },

  watch: {
    selectedGroup(val) {
      for (const i in this.groupCodeList) {
        const item = this.groupCodeList[i];
        if (item.grpCd === val) {
          this.selectedGroupName = item.grpCdName;
        }
      }
    },

    editGroupDialog(val) {
      val || this.groupCodeDialogClose();
    },
  },
};
</script>
