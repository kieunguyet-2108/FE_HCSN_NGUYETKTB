<template>
  <div @keydown="handleEventKeyDown">
    <div class="content">
      <div class="content-top" style="height: 40px">
        <div class="content-top__title">Ghi tăng tài sản</div>
        <div class="data-action">
          <MISAButton
            class="button button__main"
            text="Thêm"
            @click="handleAction(this.$msEnum.MS_ACTION.Add)"
          ></MISAButton>
          <div
            class="data-layout"
            v-clickOutside="
              () => {
                isShowLayoutMenu = false
              }
            "
            @click="isShowLayoutMenu = !isShowLayoutMenu"
          >
            <div class="layout-icon">
              <div :class="iconLayout.icon"></div>
            </div>
            <div class="layout-icon">
              <div class="ms-icon ms-icon-arrow-down-gray"></div>
            </div>
            <div class="layout-menu" v-if="isShowLayoutMenu">
              <div
                class="layout-menu__item"
                @click="handleLayout(option)"
                v-for="(option, index) in layoutOptions"
                :key="index"
              >
                <div class="layout-item__icon" :class="option.icon"></div>
                <div class="layout-item__text">{{ option.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content-bottom" :style="vourcherStyle">
        <div class="content-bottom__filter">
          <MISAInput
            type="text"
            placeholder="Tìm kiếm theo số chứng từ, nội dung"
            className="input__field box-shadow-none flex-1"
            style="padding: 0px 12px 0px 0px !important"
            :isValidate="false"
            icon="ms-icon ms-22 ms-icon-search-black"
            v-model="voucherFilter.textSearchFilter"
          ></MISAInput>
          <div class="data-action">
            <div
              class="action-item flex column tooltip"
              v-if="voucherSelected.length > 0"
            >
              <MISATooltipV1 content="Xóa">
                <MISAButton
                  ref="deleteButton"
                  class="button__icon box-shadow-none"
                  icon="ms-icon-trash-red ms-24"
                  @click="onClickDeleteRow(voucherSelected)"
                ></MISAButton>
              </MISATooltipV1>
            </div>
            <div class="action-item flex column tooltip">
              <MISATooltipV1 content="In">
                <MISAButton
                  class="button__icon box-shadow-none"
                  icon="ms-icon ms-icon-print ms-18"
                ></MISAButton>
              </MISATooltipV1>
            </div>
            <div class="action-item flex column tooltip">
              <MISATooltipV1 content="Tiện ích">
                <MISAButton
                  class="button__icon box-shadow-none"
                  icon="ms-icon ms-icon-three-dot"
                ></MISAButton>
              </MISATooltipV1>
            </div>
          </div>
        </div>
        <MISATable
          tableRef="voucherTable"
          :listData="listVoucher"
          :listColumn="voucherColumns"
          @delete="handleAction"
          @edit="handleAction"
          @clickRow="handleClickRow"
          :pagingOptions="voucherPagination.pagingOptions"
          :summary="summary"
          :totalRecord="totalRecord"
          :pageNumber="voucherPagination.pageNumber"
          :pageSize="voucherPagination.pageSize"
          v-model="voucherSelected"
          @changePaging="changePaging"
          @changeDropdown="changeDropdown"
          :isFocusFirstRow="true"
        ></MISATable>
        <MISALoading
          v-if="isLoadingVoucher"
          :style="{
            top: '100px',
            left: '1px',
            right: '1px',
            bottom: '40px',
          }"
        ></MISALoading>
      </div>
      <div
        class="content-bottom content-bottom__sub"
        ref="assetTable"
        :style="assetStyle"
      >
      <div class="icon_resize">
        <img src="@/assets/resize_icon.png" alt="">
      </div>
        <div class="content-bottom__filter">
          <div class="content-bottom__sub__title">Thông tin chi tiết</div>
          <div class="data-action">
            <div class="action-item flex column tooltip">
              <MISATooltipV1 :content="iconZoom.text">
                <MISAButton
                  ref="deleteButton"
                  class="button__icon box-shadow-none"
                  :icon="iconZoom.icon"
                  @click="handleZoom(iconZoom)"
                ></MISAButton>
              </MISATooltipV1>
            </div>
          </div>
        </div>
        <MISATable
          :listData="listAsset"
          :listColumn="assetColumns"
          :isShowPagination="false"
          :isCheckEmpty="false"
        ></MISATable>
        <MISALoading
          v-if="isLoadingAsset"
          :style="{
            top: '74px',
            left: '1px',
            right: '1px',
            bottom: '45px',
          }"
        ></MISALoading>
      </div>
    </div>
    <!-- <DemoResizeable></DemoResizeable> -->
    <router-view
      @insertVoucher="insertVoucher"
      @updateVoucher="updateVoucher"
    ></router-view>
    <MISAPopup
      :popupMessage="popupInformation.popupMessage"
      :popupMode="popupInformation.popupMode"
      v-if="popupInformation.isShowPopup"
    ></MISAPopup>
    <MISADialog
      ref="dialog"
      v-if="dialogInformation.isShowDialog"
      :dialogMessages="dialogInformation.messages"
      :buttonList="dialogInformation.buttonList"
      :styleIcon="dialogInformation.styleIcon"
    ></MISADialog>
    <ShortcutGuide :isShowShortcutGuide="isShowShortCut"></ShortcutGuide>
  </div>
</template>

<script>
// import DemoResizeable from './demo.vue'
import _ from 'lodash'
import column from '@/js/column.js'
import vClickOutside from 'click-outside-vue3'
import MISATable from '@/components/base/MISATable.vue'
import MISAButton from '@/components/base/MISAButton.vue'
import MISAInput from '@/components/base/MISAInput.vue'
import MISALoading from '@/components/base/MISALoading.vue'
import MISADialog from '@/components/base/MISADialog.vue'
import MISAPopup from '@/components/base/MISAPopup.vue'
export default {
  name: 'AssetIncreaseRecording',
  components: {
    MISAButton,
    MISATable,
    MISAInput,
    MISALoading,
    MISADialog,
    MISAPopup,
  },
  directives: {
    clickOutside: vClickOutside.directive,
  },
  data() {
    return {
      isLoadingVoucher: false,
      isLoadingAsset: false,
      vourcherStyle: {
        'max-height': '400px',
        'min-height': '400px',
      },
      assetStyle: {
        'max-height': 'calc(100vh - 540px)',
        'min-height': 'calc(100vh - 540px)',
      },
      isShowShortCut: false,
      dialogInformation: {}, // thông tin dialog
      popupInformation: {}, // thông tin popup
      isShowLayoutMenu: false,
      layoutOptions: [
        {
          icon: 'ms-icon ms-icon-vertical-layout',
          text: 'Giao diện dọc',
          action: this.$msEnum.MS_INCREASE_ASSET_ACTION.VerticalLayout,
        },
        {
          icon: 'ms-icon ms-icon-horizontal-layout',
          text: 'Giao diện ngang',
          action: this.$msEnum.MS_INCREASE_ASSET_ACTION.HorizontalLayout,
        },
      ],
      iconZoom: {
        icon: 'ms-icon-3 ms-icon-zoom-in',
        text: 'Phóng to',
        action: this.$msEnum.MS_INCREASE_ASSET_ACTION.ZoomIn,
      },
      iconLayout: {
        icon: 'ms-icon ms-icon-vertical-layout',
        text: 'Giao diện dọc',
        action: this.$msEnum.MS_INCREASE_ASSET_ACTION.VerticalLayout,
      },
      voucherColumns: [],
      assetColumns: [],
      listVoucher: [],
      listAsset: [],
      voucherSelected: [],
      summary: [
        {
          field: 'total_orgprice',
          value: 0,
          width: '80px',
        },
      ],
      voucherFilter: {
        textSearchFilter: '',
      },
      voucherPagination: {
        pageNumber: 1,
        pageSize: 10,
        totalRecord: 0,
        pagingOptions: [
          { key: 10, value: 10 },
          { key: 20, value: 20 },
          { key: 50, value: 50 },
          { key: 100, value: 100 },
        ],
      },
      voucherItem: {},
    }
  },
  async created() {
    await this.getVourcherListByPaging()
  },
  mounted() {
    this.$nextTick(async () => {
      this.voucherColumns = column.vourcherColumns
      this.assetColumns = column.assetColumns
    })
  },
  computed: {
    action: {
      get() {
        return this.$store.getters.getActionStatus
      },
      set(value) {
        this.$store.commit('setActionStatus', value)
      },
    },
    filterVoucher() {
      let tempFilter = []
      if (
        this.voucherFilter.textSearchFilter != null ||
        this.voucherFilter.textSearchFilter != ''
      ) {
        tempFilter.push({
          field: 'voucher_code',
          value: this.voucherFilter.textSearchFilter,
          condition: this.$msEnum.MS_FILTER_CONDITION.Like,
          operators: this.$msEnum.MS_FILTER_OPERATOR.Or,
        })
        tempFilter.push({
          field: 'description',
          value: this.voucherFilter.textSearchFilter,
          condition: this.$msEnum.MS_FILTER_CONDITION.Like,
        })
      }
      return tempFilter
    },
  },
  watch: {
    action(action) {
      const me = this
      switch (action) {
        case me.$msEnum.MS_INCREASE_ASSET_ACTION.VerticalLayout: // giao diện dọc
          me.assetStyle = 'display: none'
          me.vourcherStyle = {
            display: 'flex',
            'max-height': 'calc(100vh - 130px)',
            'min-height': 'calc(100vh - 130px)',
          }
          break
        case me.$msEnum.MS_INCREASE_ASSET_ACTION.HorizontalLayout: // giao diện ngang
          me.assetStyle = {
            display: 'flex',
            'max-height': 'calc(100vh - 540px)',
            'min-height': 'calc(100vh - 540px)',
          }
          me.vourcherStyle = {
            display: 'flex',
            'max-height': '400px',
            'min-height': '400px',
          }
          break
        case me.$msEnum.MS_INCREASE_ASSET_ACTION.ZoomIn: // phóng to
          me.assetStyle = {
            display: 'flex',
            'max-height': 'calc(100vh - 140px)',
            'min-height': 'calc(100vh - 140px)',
          }
          me.vourcherStyle = 'display: none'
          break
        case me.$msEnum.MS_INCREASE_ASSET_ACTION.ZoomOut: // thu nhỏ
          me.assetStyle = {
            display: 'flex',
            'max-height': 'calc(100vh - 540px)',
            'min-height': 'calc(100vh - 540px)',
          }
          me.vourcherStyle = {
            display: 'flex',
            'max-height': '400px',
            'min-height': '400px',
          }
          break
        default:
          break
      }
    },
    'voucherFilter.textSearchFilter': _.debounce(function () {
      this.voucherPagination.pageNumber = 1
      this.getVourcherListByPaging()
    }, 500),
  },
  methods: {
    handleMouseDown(e) {
      console.log(e, 'mouse down');
      window.addEventListener('mousemove', this.handleMouseMove, false)
      window.addEventListener('mouseup', this.handleMouseUp, false)
    },
    handleMouseUp(e) {
      console.log(e, 'mouse up')
    },
    handleMouseMove(e) {
      // lấy ra ref assetTable
      console.log(e, 'mouse move');

      // 
    },
    /**
     * @description:
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 06/07/2023
     */
    async handleClickRow(item) {
      const me = this
      me.voucherItem = await item
      await me.getFixedAssetList()
    },
    /**
     * @description: Thực hiện xử lí các action thêm sửa xóa liên quan tới chứng từ
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 06/07/2023
     */
    handleAction(action, item) {
      const me = this
      switch (action) {
        case me.$msEnum.MS_ACTION.Add:
          me.$router.push('/asset/increase-asset/add-voucher')
          break
        case me.$msEnum.MS_ACTION.Edit:
          me.$router.push(
            `/asset/increase-asset/add-voucher/${item.voucher_id}`
          )
          break
        case me.$msEnum.MS_ACTION.Delete:
          me.onClickDeleteRow([item])
          break
        default:
          break
      }
    },
    /**
     * @description:
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 29/06/2023
     */
    onClickDeleteRow(items) {
      const me = this
      let dialogMessage = ''
      // show message confirm
      if (items.length == 1) {
        let itemDelete = items[0]
        dialogMessage =
          `<div>${me.$msResource.DIALOG_MESSAGE.Voucher_Delete_OneRecord}</div>`.format(
            `<strong>${itemDelete.voucher_code}</strong>`
          )
      } else {
        dialogMessage =
          `<div>${me.$msResource.DIALOG_MESSAGE.Voucher_Delete_MultiRecord}</div>`.format(
            `<strong>${items.length}</strong>`
          )
      }
      me.dialogInformation = {
        isShowDialog: true,
        messages: [
          {
            field: 'message',
            content: dialogMessage,
            style: 'display: flex; flex-direction: column;',
          },
        ],
        buttonList: [
          {
            text: 'Xóa',
            buttonClass: 'button button__main',
            isFocus: true,
            onclick: async () => {
              me.deleteVoucher(items)
            },
          },
          {
            text: 'Không',
            buttonClass: 'button button__outline',
            onclick: () => {
              me.dialogInformation.isShowDialog = false
            },
          },
        ],
      }
    },
    /**
     * @description:
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 06/07/2023
     */
    async deleteVoucher(items) {
      const me = this
      var selectedList = []
      // thực hiện lấy ra danh sách id cần xóa
      items.forEach((item) => {
        selectedList.push(item.voucher_id)
      })
      try {
        // gọi api xóa dữ liệu
        const result = await me.$msApi.voucher.deleteVoucher(selectedList)
        // kiểm tra kết quả trả về
        if (result.status == me.$msEnum.MS_CODE.SUCCESS) {
          if (items.length == me.listVoucher.length) {
            if (me.voucherPagination.pageNumber > 1) {
              me.voucherPagination.pageNumbe =
                me.voucherPagination.pageNumbe - 1
            }
          }
          me.voucherSelected = []
          me.showPopup(
            me.$msResource.POPUP_MESSAGE.Msg_Delete_Success,
            me.$msEnum.MS_POPUP_MODE.Success
          )
          me.loadData()
        } else {
          me.showPopup(
            me.$msResource.POPUP_MESSAGE.Msg_Delete_Failed,
            me.$msEnum.MS_POPUP_MODE.Error
          )
        }
      } catch (error) {
        console.log(error)
      }
      me.dialogInformation.isShowDialog = false
    },
    /**
     * @description: Thực hiện show popup
     * @param: {message, popupCase}: message: nội dung popup, popupCase: trạng thái popup
     * @return: {any}
     * @author: NguyetKTB 04/05/2023
     */
    async showPopup(message, popupMode) {
      // load data xong show popup
      this.popupInformation.isShowPopup = true
      this.popupInformation.popupMessage = message
      this.popupInformation.popupMode = popupMode
      setTimeout(() => {
        this.popupInformation.isShowPopup = false
      }, 3000)
    },
    /**
     * @description: Hàm thực hiện gọi api lấy dữ liệu theo paging và filter
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 05/05/2023
     */
    async loadData() {
      this.isLoadingVoucher = true
      // set time out 1s để tắt loading
      await this.getVourcherListByPaging()
      this.isLoadingVoucher = false
    },
    /**
     * @description: Thực hiện gọi api lấy danh sách chứng từ
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 23/06/2023
     */
    async getVourcherListByPaging() {
      const me = this
      me.isLoadingVoucher = true
      var filters = []
      me.filterVoucher.forEach((filter) => {
        if (filter.value != '') {
          filters.push(filter)
        }
      })
      try {
        const result = await me.$msApi.voucher.getVouchersByPaging(
          me.voucherPagination.pageNumber,
          me.voucherPagination.pageSize,
          filters
        )
        if (result == null) {
          me.listVoucher = []
          me.totalRecord = 0
          me.summary.find((x) => x.field == 'total_orgprice').value = 0
        } else if (result.status == me.$msEnum.MS_CODE.SUCCESS) {
          me.listVoucher = await result.data.data.data
          me.totalRecord = await result.data.data.totalRecord
          me.summary.find((x) => x.field == 'total_orgprice').value =
            await result.data.data.summary.totalOfCost
        }
      } catch (error) {
        console.log(error)
      }
      me.isLoadingVoucher = false
    },

    /**
     * @description: Lấy danh sách tài sản cố định theo chứng từ
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 25/06/2023
     */
    async getFixedAssetList() {
      const me = this
      me.assetLoading = true
      try {
        const result = await me.$msApi.fixed_asset.getAllByVoucher(
          me.voucherItem.voucher_id
        )
        if (result == null || result.status != me.$msEnum.MS_CODE.SUCCESS) {
          me.listAsset = []
        } else {
          me.listAsset = await result.data.data
        }
      } catch (error) {
        console.log(error)
      }
      me.assetLoading = false
    },
    /**
     * @description:
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 10/07/2023
     */
    insertVoucher(voucher) {
      const me = this
      if (voucher != null) {
        me.hideModal()
        me.listVoucher.unshift(voucher)
        me.totalRecord += 1
        me.summary.find((x) => x.field == 'total_orgprice').value =
          me.summary.find((x) => x.field == 'total_orgprice').value +=
            voucher.total_orgprice
        me.showPopup(
          me.$msResource.POPUP_MESSAGE.Msg_Add_Success,
          me.$msEnum.MS_POPUP_MODE.Success
        )
      } else {
        me.hideModal()
        me.showPopup(
          me.$msResource.POPUP_MESSAGE.Msg_Add_Failed,
          me.$msEnum.MS_POPUP_MODE.Error
        )
      }
    },
    updateVoucher(voucher) {
      const me = this
      if (voucher > 0) {
        me.hideModal()
        me.listVoucher.splice(me.voucherIndex, 1, voucher)
        me.showPopup(
          me.$msResource.POPUP_MESSAGE.Msg_Edit_Success,
          me.$msEnum.MS_POPUP_MODE.Success
        )
      } else {
        me.hideModal()
        me.showPopup(
          me.$msResource.POPUP_MESSAGE.Msg_Edit_Failed,
          me.$msEnum.MS_POPUP_MODE.Error
        )
      }
      me.loadData()
    },
    /**
     * @description:
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 20/06/2023
     */
    showWriteAssetForm() {
      this.$store.commit(
        'setActionStatus',
        this.$msEnum.MS_INCREASE_ASSET_ACTION.AddVoucher
      )
      this.$router.push('/asset/increase-asset/add-voucher')
    },
    /**
     * @description: Thực hiện xử lí khi người dùng click icon thay đổi layout
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 20/06/2023
     */
    handleLayout(option) {
      this.iconLayout = option
      this.$store.commit('setActionStatus', option.action)
    },
    /**
     * @description: Thục hiện ẩn modal
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 11/06/2023
     */
    hideModal() {
      this.$router.push('/asset/increase-asset')
    },
    /**
     * @description: Thực hiện xử lí khi người dùng click icon thay đổi zoom
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 20/06/2023
     */
    handleZoom(iconZoom) {
      this.$store.commit('setActionStatus', iconZoom.action)
      if (iconZoom.action === this.$msEnum.MS_INCREASE_ASSET_ACTION.ZoomIn) {
        this.iconZoom = {
          icon: 'ms-icon-3 ms-icon-zoom-out',
          text: 'Thu nhỏ',
          action: this.$msEnum.MS_INCREASE_ASSET_ACTION.ZoomOut,
        }
      } else {
        this.iconZoom = {
          icon: 'ms-icon-3 ms-icon-zoom-in',
          text: 'Phóng to',
          action: this.$msEnum.MS_INCREASE_ASSET_ACTION.ZoomIn,
        }
      }
    },
    /**
     * @description: Thực hiện load lại data khi người dùng click paging dưới table
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 25/05/2023
     */
    changePaging(pageNumber) {
      this.voucherPagination.pageNumber = pageNumber
      this.getVourcherListByPaging()
    },
    /**
     * @description: thực hiện load lại data khi người dùng thay đổi dropdown trên filter
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 25/05/2023
     */
    changeDropdown(value) {
      this.voucherPagination.pageSize = value.key
      this.voucherPagination.pageNumber = 1
      this.getVourcherListByPaging()
    },
  },
}
</script>

<style scoped>
.content-top__title {
  font-size: 22px;
  font-weight: 700;
  color: #333333;
}
.content-bottom__sub__title {
  font-size: 15px;
  font-weight: 700;
  color: #333333;
  display: flex;
  align-items: center;
}
.data-layout {
  display: flex;
  align-items: center;
  gap: 15px;
  border-radius: 4px;
  height: 100%;
  background-color: #fff;
  padding: 0px 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.data-layout .layout-icon {
  display: flex;
  align-items: center;
  height: 100%;
}
.layout-menu {
  position: absolute;
  top: 97px;
  right: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
}
.layout-menu .layout-menu__item {
  padding: 10px;
  display: flex;
  gap: 10px;
}
.layout-menu .layout-menu__item:hover {
  background-color: #d1edf4;
}
.table-content {
  border: none !important;
  border-radius: 0px !important;
}
.content-bottom {
  background-color: #fff;
  flex: 2;
}
.content-bottom__filter {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
}
.content-bottom__filter .input-group {
  width: 300px;
}
.input__field.flex-1 {
  flex: 1 !important;
}
.data-action .button__icon {
  height: 36px;
}
.data-action {
  gap: 20px;
}
.content-bottom__sub {
  flex: 1 !important;
  margin-top: 10px;
}
.content-bottom__sub .content-bottom__filter {
  padding: 0px 15px 0px 15px !important;
}
.data-action .button__icon {
  height: 36px;
  width: 20px;
  cursor: pointer;
}
.icon_resize {
  cursor: pointer;
  width: 15px;
  height: 15px;
  position: absolute;
  top: -8px;
  left: 50%;
}
.icon_resize img{
  width: 15px;
}

@import url(@/css/layouts/content/content.css);
</style>