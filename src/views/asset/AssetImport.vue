<template>
  <div class="content">
    <div class="content-top">
      <!-- HIỂN THỊ STATUS IMPORT -->
      <div
        v-for="(sta, index) in status"
        :key="index"
        class="status__item"
        :class="{ 'status__item--active': statusImport === sta.key }"
      >
        <div class="status__item--value">{{ sta.value }}</div>
        <div>{{ sta.description }}</div>
      </div>
    </div>
    <div class="content-bottom">
      <!-- LOADING -->
      <div class="loading-container" v-if="isLoading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Đang tải...</div>
      </div>

      <!-- PHẦN HIỂN THỊ TRANG THÁI TẢI TỆP -->
      <div
        v-if="
          statusImport == this.$msEnum.MS_STATUS_IMPORT.Import && !isLoading
        "
      >
        <div class="input_container">
          <label for="images" class="drop-container">
            <div
              class="file-drop"
              @dragover.prevent="
                (e) => e.currentTarget.classList.add('dragover')
              "
              @dragleave="(e) => e.currentTarget.classList.remove('dragover')"
              @drop.prevent="dropFile"
            >
              <MISATooltipV1 content="Kéo thả tệp vào đây">
                <div
                  class="ms-icon ms-icon-drop-file"
                  style="width: 18px; height: 21px"
                ></div>
              </MISATooltipV1>
              hoặc
              <MISATooltipV1 content="Click vào đây để chọn tệp">
                <div class="button button__main">Chọn tệp</div>
                <input
                  type="file"
                  id="images"
                  required
                  @change="selectFile()"
                  ref="file"
                />
              </MISATooltipV1>
            </div>
          </label>
          <div class="input_info">
            <MISATooltipV1 :content="fileName">
              <div class="file_name" v-if="fileName">
                <div class="ms-14 ms-icon ms-icon-file"></div>
                <div>{{ fileName }}</div>
              </div>
            </MISATooltipV1>
            <div
              class="file-message"
              :class="{
                'error-message': !isValid && fileName.length > 0,
                'success-message': isValid && fileName.length > 0,
              }"
            >
              {{ importInformation.message }}
            </div>
          </div>
        </div>
      </div>
      <!-- HIỂN THỊ PHẦN DỮ LIỆU LỖI NẾU CÓ -->
      <div
        class="handle--data__content"
        v-if="
          statusImport == this.$msEnum.MS_STATUS_IMPORT.Handle && !isLoading
        "
      >
        <div
          class="handle--data__header"
          v-if="displayList != null && displayList.length > 0"
        >
          <div
            :class="{
              'error-message': !isValid,
              'success-message': isValid,
            }"
          >
            {{ importInformation.message }}
          </div>
        </div>
        <div v-if="displayList == null">
          <div
            class="text-center"
            :class="{
              'error-message': !isValid,
              'success-message': isValid,
            }"
          >
            {{ importInformation.message }}
          </div>
        </div>
        <div
          class="table-content"
          v-if="displayList != null && displayList.length > 0"
        >
          <table id="table__data--import">
            <thead>
              <tr>
                <th class="record__notification" v-if="!isValid">Thông báo</th>
                <th
                  v-for="(field, index) in excelFields"
                  :key="index"
                  style="width: 120px; min-width: 120px"
                  :style="{ textAlign: getStyleByType(field.field_type) }"
                >
                  {{ field.field_name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in displayList" :key="index">
                <td class="record__notification" v-if="!isValid">
                  <ul>
                    <li v-for="(msg, i) in item.messages" :key="i">
                      <span v-for="(m, i) in msg" :key="i">
                        {{ m }}
                      </span>
                    </li>
                  </ul>
                </td>
                <td
                  v-for="(field, index) in excelFields"
                  :key="index"
                  :style="{
                    textAlign: getStyleByType(field.field_type),
                  }"
                >
                  <MISATooltipV1
                    :content="
                      formatData(field.field_type, item[field.field_key])
                    "
                    v-if="!isValid"
                  >
                    <span
                      v-html="
                        formatData(
                          field.field_type,
                          item.rowData[field.field_key]
                        )
                      "
                    ></span>
                  </MISATooltipV1>

                  <MISATooltipV1
                    :content="
                      formatData(field.field_type, item[field.field_key])
                    "
                    v-if="isValid"
                  >
                    <span
                      v-html="
                        formatData(field.field_type, item[field.field_key])
                      "
                    >
                    </span>
                  </MISATooltipV1>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- HIỂN THỊ THÔNG BÁO HOÀN TẤT  -->
      <div
        v-if="statusImport == this.$msEnum.MS_STATUS_IMPORT.Done && !isLoading"
        style="height: 100%"
      >
        <div class="notification">
          <div>
            <img
              src="@/assets/ImportIcon_Fail.png"
              alt=""
              style="height: 200px"
              v-if="!isValid"
            />
            <img
              src="@/assets/ImportIcon_Success.png"
              alt=""
              style="height: 200px"
              v-else
            />
          </div>
          <div>
            <div>
              <span
                class="notification-message"
                :class="{
                  'error-message': !isValid,
                  'noti-message-success': isValid,
                }"
              >
                {{ importInformation.message }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="content__footer--import" v-if="!isLoading">
        <div
          class="content__footer--button"
          v-for="(item, index) in importInformation.footer"
          :key="index"
        >
          <MISATooltipV1 :content="item.buttonTooltip">
            <MISAButton
              :type="item.buttonType"
              :text="item.buttonText"
              :disabled="item.disabled"
              @onClickButton="item.buttonEvent"
            ></MISAButton>
          </MISATooltipV1>
        </div>
      </div>
    </div>
    <MISADialog
      ref="dialog"
      v-if="dialogInformation.isShowDialog"
      :dialogMessages="dialogInformation.messages"
      :buttonList="dialogInformation.buttonList"
      :styleIcon="dialogInformation.styleIcon"
    ></MISADialog>
  </div>
</template>
<script>
/* eslint-disable */
import MISADialog from '@/components/base/MISADialog.vue'
import MISAButton from '@/components/base/MISAButton.vue'
import MISATooltipV1 from '@/components/base/MISATooltipV1.vue'
import MISAModal from '@/components/base/MISAModal.vue'
import MISAInput from '@/components/base/MISAInput.vue'
import _ from 'lodash'
export default {
  name: 'AssetImport',
  components: {
    MISAModal,
    MISATooltipV1,
    MISAButton,
    MISADialog,
    MISAInput,
  },
  props: {},
  data() {
    return {
      isLoading: false,
      statusImport: this.$msEnum.MS_STATUS_IMPORT.Import,
      fileName: '',
      file: null,
      data: [],
      error: [],
      excelFields: [],
      status: [
        {
          key: this.$msEnum.MS_STATUS_IMPORT.Import,
          value: '1',
          description: 'Tải tệp lên',
        },
        {
          key: this.$msEnum.MS_STATUS_IMPORT.Handle,
          value: '2',
          description: 'Kiểm tra dữ liệu',
        },
        {
          key: this.$msEnum.MS_STATUS_IMPORT.Done,
          value: '3',
          description: 'Hoàn tất',
        },
      ],
      displayList: [],
      isValid: null,
      importInformation: {
        message: '',
        footer: [
          {
            buttonType: 'outline',
            buttonText: 'Hủy bỏ',
            buttonTooltip: 'Hủy bỏ',
            buttonEvent: this.backToHome,
            disabled: false,
          },
          {
            buttonType: 'sub',
            buttonText: 'Quay lại',
            buttonTooltip: 'Quay lại',
            buttonEvent: this.backStatus,
            disabled: true,
          },
          {
            buttonType: 'main',
            buttonText: 'Tiếp tục',
            buttonTooltip: 'Tiếp tục',
            buttonEvent: this.nextStatus,
            disabled: true,
          },
        ],
      },
      dialogInformation: {},
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleEventKeydown)
    this.getExcelFields()
  },
  watch: {
    isValid: function (value) {
      this.importInformation.footer[2].disabled = !value
    },
    statusImport: function (value) {
      this.importInformation.footer[1].buttonText = 'Quay lại'
      this.importInformation.footer[1].buttonTooltip = 'Quay lại'
      this.importInformation.footer[2].buttonText = 'Tiếp tục'
      this.importInformation.footer[2].buttonTooltip = 'Tiếp tục'
      switch (value) {
        case this.$msEnum.MS_STATUS_IMPORT.Import:
          this.handleFile(this.file)
          this.importInformation.footer[1].disabled = true
          break
        case this.$msEnum.MS_STATUS_IMPORT.Handle:
          this.importInformation.footer[1].disabled = false
          // this.sendFile();
          break
        case this.$msEnum.MS_STATUS_IMPORT.Done:
          this.importInformation.footer[1].buttonText = 'Nhập file khác'
          this.importInformation.footer[1].buttonTooltip = 'Nhập file khác'
          this.importInformation.footer[2].buttonText = 'Hoàn tất'
          this.importInformation.footer[2].buttonTooltip = 'Hoàn tất'
          // this.importFile();
          break
        default:
          break
      }
    },
  },
  methods: {
    /**
     * @description: Thực hiện xử lí khi nhấn button tiếp tục
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 10/06/2023
     */
    nextStatus() {
      const me = this
      switch (me.statusImport) {
        case me.$msEnum.MS_STATUS_IMPORT.Import:
          me.statusImport = me.$msEnum.MS_STATUS_IMPORT.Handle
          me.sendFile()
          break
        case me.$msEnum.MS_STATUS_IMPORT.Handle:
          me.statusImport = me.$msEnum.MS_STATUS_IMPORT.Done
          me.importFile()
          break
        case me.$msEnum.MS_STATUS_IMPORT.Done:
          // me.$emit("importAsset", me.data);
          me.$router.push('/asset')
          break
        default:
          break
      }
    },
    /**
     * @description: Thực hiện xử lí khi nhấn button quay lại
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 10/06/2023
     */
    backStatus() {
      const me = this
      switch (me.statusImport) {
        case me.$msEnum.MS_STATUS_IMPORT.Import:
          me.backToHome()
          break
        case me.$msEnum.MS_STATUS_IMPORT.Handle:
          me.statusImport = me.$msEnum.MS_STATUS_IMPORT.Import
          break
        case me.$msEnum.MS_STATUS_IMPORT.Done:
          me.statusImport = me.$msEnum.MS_STATUS_IMPORT.Import
          me.$router.push('/asset/import')
          break
        default:
          break
      }
    },
    /**
     * @description: Thực hiện quay lại trang tài sản
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 10/06/2023
     */
    backToHome() {
      const me = this
      me.dialogInformation = {
        isShowDialog: true,
        messages: [
          {
            field: '1',
            content: 'Bạn có muốn hủy bỏ việc nhập khẩu tài sản không?',
            style: 'display: flex; flex-direction: column;',
          },
        ],
        buttonList: [
          {
            text: 'Hủy bỏ',
            buttonType: 'main',
            isFocus: true,
            onclick: () => {
              this.dialogInformation.isShowDialog = false
              me.$router.push('/asset')
            },
          },
          {
            text: 'Không',
            buttonType: 'outline',
            onclick: () => {
              this.dialogInformation.isShowDialog = false
            },
          },
        ],
      }
    },
    /**
     * @description: Thực hiện format những trường dữ liệu cần format
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 07/06/2023
     */
    formatData(fieldType, value) {
      const me = this
      if (typeof fieldType === 'string') fieldType = parseInt(fieldType)
      switch (fieldType) {
        case me.$msEnum.MS_FIELD_TYPE.Decimal:
          return new Intl.NumberFormat('vi-VN').format(value)
        case me.$msEnum.MS_FIELD_TYPE.DateTime:
          let date = new Date(value)
          // convert dữ liệu datetime sang định dạng dd/MM/yyyy
          if (isNaN(date) || value == null || value == '0001-01-01T00:00:00') {
            return ''
          } else {
            return date.toLocaleDateString('en-GB', {
              timeZone: 'Asia/Ho_Chi_Minh',
            })
          }
        default:
          return value
      }
    },
    /**
     * @description: Xử lý sự kiện nhấn phím của người dùng
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 04/06/2023
     */
    handleEventKeydown(event) {
      if (event.key === 'Escape') {
        this.closeModal()
      }
    },

    /**
     * @description: Lấy style cho từng loại dữ liệu
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 04/06/2023
     */
    getStyleByType(type) {
      const me = this
      if (typeof type === 'string') type = parseInt(type)
      switch (type) {
        case me.$msEnum.MS_FIELD_TYPE.String:
          return 'start'
        case me.$msEnum.MS_FIELD_TYPE.Int:
          return 'end'
        case me.$msEnum.MS_FIELD_TYPE.Decimal:
          return 'end'
        default:
          return 'center'
      }
    },
    /**
     * @description: Đóng modal form bằng cách chuyển về trang asset
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 01/05/2023
     */
    closeModal() {
      this.$router.push('/asset')
    },
    /**
     * @description: Thực hiện lấy ra các cột trong file excel
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 04/06/2023
     */
    async getExcelFields() {
      const me = this
      try {
        const response = await me.$msApi.import_file.getExcelFields()
        if (response.status == me.$msEnum.MS_CODE.SUCCESS) {
          me.excelFields = response.data.data
        }
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * @description: Thực hiện lấy ra file khi người dùng kéo thả file vào vùng chọn file
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 10/06/2023
     */
    dropFile(event) {
      event.target.classList.remove('dragover')
      const files = event.dataTransfer.files
      this.handleChangeFile(files)
    },
    /**
     * @description: Thực hiện lấy ra file khi người dùng chọn file
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 10/06/2023
     */
    selectFile() {
      const files = this.$refs.file.files
      this.handleChangeFile(files)
    },
    /**
     * @description: Thực hiện xử lí kiểm tra định dạng file khi người dùng chọn file
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 02/06/2023
     */
    async handleChangeFile(files) {
      const me = this
      me.statusImport = me.$msEnum.MS_STATUS_IMPORT.Import
      const file = files[0]
      if (!file) {
        me.isValid = false
        me.importInformation.message = 'Vui lòng chọn file '
        return
      } else {
        me.fileName = file.name
        // kiểm tra file có đúng định dạng không (xlsx, xls)
        me.handleFile(file)
      }
    },

    /**
     * @description: Xử lí kiểm tra định dạng file
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 10/06/2023
     */
    handleFile(file) {
      const me = this
      me.isLoading = true
      const fileExtension = me.fileName.split('.').pop()
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        me.isValid = false
        me.importInformation.message = me.$msResource.IMPORT_MESSAGE.Error_File
        me.data = []
      } else {
        me.file = file
        me.isValid = true
        me.importInformation.message =
          'Vui lòng nhấn nút tiếp tục để tiếp tục import.'
      }
      me.isLoading = false
    },
    /**
     * @description: Thực hiện gửi file lên server và lấy dữ liệu trả về
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 05/06/2023
     */
    async sendFile() {
      const me = this
      me.isLoading = true
      me.statusImport = me.$msEnum.MS_STATUS_IMPORT.Handle
      me.data = []
      // lấy ra những trường có dữ liệu Datetime
      const dateFields = me.excelFields.filter(
        (field) => field.field_type == me.$msEnum.MS_FIELD_TYPE.DateTime
      )
      if (me.file) {
        const formData = new FormData()
        formData.append('fromFile', me.file)
        try {
          const response = await me.$msApi.fixed_asset.sendFile(formData)
          me.data = await response.data.data
          if (response.status == me.$msEnum.MS_CODE.SUCCESS) {
            // trường hợp không có lỗi
            me.isValid = true
            me.importInformation.message = 'Bản ghi hợp lệ.'
          } else if (response.status == me.$msEnum.MS_CODE.BAD_REQUEST) {
            me.isValid = false
            if (me.data == null || me.data.length == 0) {
              me.importInformation.message = response.data.userMsg
            } else {
              me.importInformation.message =
                me.data.length + ' bản ghi không hợp lệ.'
            }
          } else {
            me.isValid = false
            me.importInformation.message =
              me.$msResource.IMPORT_MESSAGE.Error_Data
          }
          me.displayList = _.cloneDeep(me.data)
        } catch (e) {
          console.log(e)
        }
        me.isLoading = false
      }
    },
    /**
     * @description: Thực hiện import dữ liệu sau khi file đã được xử lý
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 05/06/2023
     */
    async importFile() {
      const me = this
      me.isLoading = true
      me.statusImport = me.$msEnum.MS_STATUS_IMPORT.Done
      if (!me.isValid) {
        me.importInformation.message = me.$msResource.IMPORT_MESSAGE.Error_Data
      } else {
        try {
          const response = await me.$msApi.fixed_asset.importData(me.data)
          if (response.status == me.$msEnum.MS_CODE.CREATED) {
            me.isValid = true
            me.importInformation.message =
              me.$msResource.IMPORT_MESSAGE.Import_Success
          } else {
            me.isValid = false
            me.importInformation.message =
              me.$msResource.IMPORT_MESSAGE.Import_Failed
          }
        } catch (error) {
          console.log(error)
        }
      }
      me.isLoading = false
    },
  },
}
</script>
<style scoped>
@import url(@/css/layouts/content/import.css);
@import url(@/css/components/form.css);
@import url(@/css/layouts/content/content.css);
</style>