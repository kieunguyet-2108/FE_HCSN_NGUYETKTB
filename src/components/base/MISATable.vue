<template>
  <div class="table-content" @keydown="handleTableKeyDown" :style="tableStyle">
    <table id="table-data" :ref="tableRef">
      <thead class="table__header">
        <tr>
          <th
            v-for="(item, index) in listColumnCustom"
            :key="index"
            :style="{
              width: item.columnWidth,
              'min-width': item.minColumnWidth,
              'max-width': item.maxColumnWidth,
              top: item.top,
              right: item.right,
              position: item.position,
            }"
          >
            <div
              class="checkbox-element"
              v-if="item.name == 'checkbox'"
              :style="{ textAlign: getStyleByType(item.type) }"
            >
              <input
                ref="checkboxAllRef"
                type="checkbox"
                class="checkbox"
                :class="item.class"
                :name="item.key"
                :id="item.key"
                v-model="selectedAll"
                @click="checkAll()"
              />
              <label :for="item.key"></label>
            </div>

            <div
              class="cell-content"
              :style="{ textAlign: getStyleByType(item.type) }"
              v-else-if="item.isShowIndex"
            >
              <MISATooltipV1 :content="item.tooltip">
                {{ item.name }}
              </MISATooltipV1>
            </div>

            <div
              class="cell-content"
              :style="{ textAlign: getStyleByType(item.type) }"
              v-else
            >
              <MISATooltipV1 :content="item.tooltip">
                {{ item.name }}
              </MISATooltipV1>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="no-data">
        <tr>
          <td colspan="11" v-if="listData.length == 0">
            <div class="image__no-data" v-if="isCheckEmpty">
              <div class="ms-icon-2 ms-icon-image-not-found"></div>
            </div>
            <div class="message-__no-data">Không tìm thấy dữ liệu.</div>
          </td>
        </tr>
      </tbody>
      <tbody v-if="listData.length > 0">
        <tr
          v-for="(asset, indexData) in listData"
          :key="indexData"
          @dblclick="handleAction(asset, this.$msEnum.MS_ACTION.Edit, $event)"
          @click="handleClickRow(asset, $event)"
          @contextmenu="handleContextMenu(asset, $event)"
          tabindex="-1"
          :class="{
            'item--active': isExistInSelectedList(asset) || asset == focusRow,
          }"
        >
          <td
            v-for="(item, index) in listColumnCustom"
            :key="index"
            class="table__cell"
            :style="{
              width: item.columnWidth,
              'min-width': item.minColumnWidth,
              'max-width': item.maxColumnWidth,
              top: item.top,
              right: item.right,
              position: item.position,
            }"
          >
            <!-- CHECK BOX -->
            <div
              class="checkbox-element"
              v-if="item.name == 'checkbox'"
              :style="{ textAlign: getStyleByType(item.type) }"
            >
              <input
                type="checkbox"
                class="checkbox"
                :class="item.class"
                :id="asset[item.key]"
                :value="asset"
                v-model="selectedList"
              />
              <label :for="asset[item.key]"></label>
            </div>

            <!-- SHOW ORDER INDEX -->
            <div
              class="cell-content"
              v-else-if="item.isShowIndex"
              :style="{ textAlign: getStyleByType(item.type) }"
            >
              {{ (pageNumber - 1) * pageSize + indexData + 1 }}
            </div>

            <!-- SHOW CELL ACTION -->
            <!-- TODO: Vẫn đang fix thẳng action vào table cần sửa sau -->
            <div
              class="cell-content row-action"
              v-else-if="item.key == 'action'"
            >
              <MISATooltipV1
                :content="icon.tooltip"
                v-for="(icon, index) in item.actionIcons"
                :key="index"
              >
                <div class="ms-36">
                  <div
                    :class="icon.icon"
                    @click="handleAction(asset, icon.action, $event)"
                  ></div>
                </div>
              </MISATooltipV1>
              <MISAMenu
                ref="contextMenu"
                :options="menuOptions"
                v-if="menu.isShowMenu"
                @clickItem="handleAction(asset, $event)"
                :style="{ top: menu.top, left: menu.left }"
                v-clickOutside="
                  () => {
                    menu.isShowMenu = false
                  }
                "
              ></MISAMenu>
            </div>

            <!-- SHOW CELL CONTENT -->
            <div
              ref="{{ item.key }}"
              class="cell-content"
              v-else
              :style="{ textAlign: getStyleByType(item.type) }"
              :class="{
                'voucher_code--color-blue': item.key == 'voucher_code',
              }"
            >
              <MISATooltipV1
                :content="
                  asset[item.key] != null
                    ? formatDataByType(asset[item.key], item.columnType)
                    : (item.columnType == this.$msEnum.COLUMN_TYPE.Text ? '' : 0)
                        
                "
              >
                <span
                  v-html="
                    asset[item.key] != null
                      ? formatDataByType(asset[item.key], item.columnType)
                      : (item.columnType == this.$msEnum.COLUMN_TYPE.Text ? '' : 0)
                  "
                ></span>
              </MISATooltipV1>
              <MISATooltipV1
                :content="icon.tooltip"
                v-for="(icon, i) in item.actionIcons"
                :key="i"
              >
                <MISAButton
                  :type="icon.buttonType"
                  :icon="icon.icon"
                  @click="handleAction(asset, icon.action, $event)"
                ></MISAButton>
              </MISATooltipV1>
            </div>

            <div
              v-if="
                colActionDynamic != null && index == listColumnCustom.length - 1
              "
              class="cell-content row-action-dynamic"
            >
              <MISATooltipV1
                :content="icon.tooltip"
                v-for="(icon, index) in colActionDynamic.actionIcons"
                :key="index"
                class="flex justify-content-center align-items-center"
              >
                <div class="icon--action">
                  <div
                    :class="icon.icon"
                    @click="handleAction(asset, icon.action, $event)"
                  ></div>
                </div>
              </MISATooltipV1>
            </div>
          </td>
        </tr>
        <tr></tr>
      </tbody>
      <tfoot class="table__footer">
        <tr
          :style="
            summary.length > 0
              ? 'background-color: #f5f5f5'
              : 'background-color: #fff; border-top: none;'
          "
        >
          <td v-for="(item, index) in listColumnCustom" :key="index">
            <div v-for="(sum, index) in summary" :key="index">
              <div
                v-if="item.key == sum.field && sum.value > 0"
                :style="{ textAlign: getStyleByType(item.type) }"
              >
                <MISATooltipV1 :content="sum.tooltip">
                  <span
                    v-html="
                      formatDataByType(sum.value, item.columnType, sum.type)
                    "
                    style="font-weight: bold"
                  ></span>
                </MISATooltipV1>
              </div>
              <div v-else></div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
  <div class="table__pagination" v-if="isShowPagination">
    <div class="pagination__content">
      <div class="total-record">
        Tổng số:
        <strong
          style="margin: 0px 3px"
          v-html="
            formatDataByType(totalRecord, this.$msEnum.COLUMN_TYPE.Number)
          "
        >
        </strong>
        bản ghi
      </div>
      <div class="pagination__combobox">
        <MISADropdown
          :options="pagingOptions"
          :selectedValue="pageSize"
          @changeDropdown="changeDropdown"
        ></MISADropdown>
      </div>
      <MISAPagination
        v-if="listData.length > 0"
        :pageSize="pageSize"
        :pageNumber="pageNumber"
        :totalRecord="totalRecord"
        @changePaging="changePaging"
      ></MISAPagination>
    </div>
  </div>
</template>
    
    <script>
/* eslint-disable */
import MISATooltip from './MISATooltip.vue'
import MISAPagination from './MISAPagination.vue'
import MISADropdown from './MISADropdown.vue'
import MISATooltipV1 from './MISATooltipV1.vue'
import MISAMenu from './MISAMenu.vue'
import vClickOutside from 'click-outside-vue3'
import MISAButton from './MISAButton.vue'
export default {
  name: 'MISATable',
  components: {
    MISATooltip,
    MISAPagination,
    MISADropdown,
    MISATooltipV1,
    MISAMenu,
    MISAButton,
  },
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    listData: {
      type: Array,
      default: () => [],
    },
    listColumn: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    pagingOptions: {
      type: Array,
      default: () => [],
    },
    summary: {
      type: Array,
      default: () => [],
    },
    totalRecord: {
      type: Number,
      default: 0,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    tableStyle: {
      type: String,
      default: '',
    },
    menuOptions: {
      type: Array,
      default: () => [],
    },
    isCheckEmpty: {
      type: Boolean,
      default: true,
    },
    primaryKey: {
      type: String,
      default: 'fixed_asset_id',
    },
    isFocusFirstRow: {
      type: Boolean,
      default: false,
    },
    tableRef: {
      type: String,
      default: Math.random().toString(36).substring(2),
    },
    isShowPagination: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selectedAll: false,
      selectedList: [],
      focusRow: {},
      menu: {
        isShowMenu: false,
        top: '',
        left: '',
      },
    }
  },
  computed: {
    listColumnCustom() {
      var lastColumn = {}
      if (this.listColumn && this.listColumn.length > 0) {
        lastColumn = this.listColumn[this.listColumn.length - 1]
      }
      if (lastColumn['isDynamic']) {
        return this.listColumn.slice(0, this.listColumn.length - 1)
      }
      return this.listColumn
    },
    colActionDynamic() {
      var lastColumn = {}
      if (this.listColumn && this.listColumn.length > 0) {
        lastColumn = this.listColumn[this.listColumn.length - 1]
      }
      if (lastColumn['isDynamic']) {
        return lastColumn
      }
      return null
    },
  },
  watch: {
    selectedList: {
      handler: async function (newVal) {
        this.selectedAll = await this.handleItemInSelectedList(newVal)
        this.$emit('update:modelValue', newVal)
      },
      deep: true,
    },
    modelValue: {
      handler: function (newVal) {
        this.selectedList = newVal
      },
      deep: true,
    },
    listData: {
      handler: async function (newVal) {
        if (newVal.length == 0) {
          this.selectedAll = false
        } else {
          // tìm ra phần tử trong listData mà có id trùng với phần tử trong selected_list
          // var rs = this.selectedList.filter((item) => {
          //   return newVal.some(
          //     (item2) => item2[this.primaryKey] == item[this.primaryKey]
          //   )
          // })
          // nếu rs.length == listData.length thì selectedAll = true
          this.selectedAll = await this.handleItemInSelectedList(
            this.selectedList
          )
          if (this.isFocusFirstRow) {
            this.$nextTick(() => {
              this.focusRow = this.listData[0]
              this.$emit('clickRow', this.listData[0])
            })
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    /**
     * @description:Thu
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 30/06/2023
     */
    checkAll() {
      this.selectedAll = !this.selectedAll
      // nếu selectedAll = true thì add tất cả các phần tử trong listData vào selected_list
      if (this.selectedAll) {
        // nếu phần tử nào chưa có trong selected_list thì add vào
        var result = this.listData.filter(
          (item) => !this.selectedList.includes(item)
        )
        this.selectedList = this.selectedList.concat(result)
      } else {
        // tìm ra các phần tử trong listData mà có id trùng với phần tử trong selected_list
        var rs = this.selectedList.filter((item) => {
          return this.listData.some(
            (item2) => item2[this.primaryKey] == item[this.primaryKey]
          )
        })
        // loại bỏ các phần tử trong selected_list có id trùng với phần tử trong listData
        this.selectedList = this.selectedList.filter(
          (item) => !rs.includes(item)
        )
      }
    },
    /**
     * @description: Thực hiện xử lí kiểm tra xem list data có tồn tại trong selected_list hay không
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 20/07/2023
     */
    async handleItemInSelectedList(items) {
      // tìm ra phần tử trong listData mà có id trùng với phần tử trong selected_list
      var rs = items.filter((item) => {
        return this.listData.some(
          (item2) => item2[this.primaryKey] == item[this.primaryKey]
        )
      })
      // nếu rs.length == listData.length thì selectedAll = true
      return rs.length == this.listData.length
    },
    /**
     * @description: Thực hiện xử lí action trong row của table
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 23/06/2023
     */
    handleAction(asset, action, event = null) {
      const me = this
      switch (action) {
        case me.$msEnum.MS_ACTION.Add:
          this.$emit('add', this.$msEnum.MS_ACTION.Add)
          break
        case me.$msEnum.MS_ACTION.Edit:
          if (event && event.target.closest('.checkbox-element')) {
            return
          }
          this.$emit('edit', this.$msEnum.MS_ACTION.Edit, asset)
          break
        case me.$msEnum.MS_ACTION.Duplicate:
          this.$emit('duplicate', this.$msEnum.MS_ACTION.Duplicate, asset)
          break
        case me.$msEnum.MS_ACTION.Delete:
          this.$emit('delete', this.$msEnum.MS_ACTION.Delete, asset)
          break
        default:
          break
      }
    },
    /**
     * @description: Thực hiện kiểm tra xem item có tồn tại trong list đã chọn hay không
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 20/06/2023
     */
    isExistInSelectedList(item) {
      const me = this
      if (me.selectedList == null || me.selectedList.length == 0) {
        return false
      } else {
        let index = me.selectedList.find((row, index) => row == item)
        if (index == undefined) {
          return false
        }
        return true
      }
    },
    /**
     * @description: Xử lí các sự kiện keydown trên bảng dữ liệu
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 01/06/2023
     */
    handleTableKeyDown(event) {
      event.preventDefault()
      const me = this
      const activeRow = me.focusRow
      switch (event.keyCode) {
        case me.$msEnum.KEY_CODE.ArrowUp:
          if (activeRow == me.listData[0]) {
            me.focusRow = me.listData[me.listData.length - 1]
          } else {
            me.focusRow = me.listData[me.listData.indexOf(activeRow) - 1]
          }
          me.handleScroll(me.listData.indexOf(me.focusRow))
          break
        case me.$msEnum.KEY_CODE.ArrowDown:
          if (activeRow == me.listData[me.listData.length - 1]) {
            me.focusRow = me.listData[0]
          } else {
            me.focusRow = me.listData[me.listData.indexOf(activeRow) + 1]
          }
          me.handleScroll(me.listData.indexOf(me.focusRow))
          break
        case me.$msEnum.KEY_CODE.Enter:
          break
        default:
          break
      }
    },
    /**
     * @description: Hàm xử lý scroll tới item được chọn
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 11/05/2023
     */
    handleScroll(indexItemFocus) {
      try {
        // lấy ra refs có tên là tableRef
        let r = this.tableRef
        this.$refs[r]
          .querySelectorAll('tbody:not(tbody.no-data) tr')
          [indexItemFocus].scrollIntoView({
            behavior: 'instant',
            block: 'center',
            inline: 'nearest',
          })
      } catch (error) {
        console.log(error)
      }
    },
    /**
     * @description: Lấy ra style cho từng loại dữ liệu
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 28/05/2023
     */
    getStyleByType(type) {
      const me = this
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
     * @description: Format dữ liệu theo type
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 18/05/2023
     */
    formatDataByType(data, type) {
      const me = this
      switch (type) {
        case me.$msEnum.COLUMN_TYPE.Number:
          return new Intl.NumberFormat('vi-VN').format(data)
        case me.$msEnum.COLUMN_TYPE.Date:
          let date = new Date(data)
          // convert dữ liệu datetime sang định dạng dd/MM/yyyy
          if (isNaN(date) || data == null || data == '0001-01-01T00:00:00') {
            return ''
          } else {
            return date.toLocaleDateString('en-GB', {
              timeZone: 'Asia/Ho_Chi_Minh',
            })
          }
        case me.$msEnum.COLUMN_TYPE.Text:
          if (data == null) {
            return ''
          }
          return data
        default:
          return data
      }
    },
    /**
     * @description: Thực hiện load lại data khi người dùng click paging dưới table
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 25/05/2023
     */
    changePaging(page) {
      this.$emit('changePaging', page)
    },
    /**
     * @description: thực hiện load lại data khi người dùng thay đổi dropdown trên filter
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 25/05/2023
     */
    changeDropdown(value) {
      this.$emit('changeDropdown', value)
    },
    /**
     * @description: Thực hiện xử lí khi người dùng click vào 1 row trên table
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 01/06/2023
     */
    handleClickRow(asset, event) {
      const me = this
      // nếu người dùng click vào checkbox thì không xử lí
      if (
        event.target.closest('.ms-icon') ||
        event.target.closest('.context__menu')
      ) {
        return
      } else if (event.target.closest('.checkbox-element')) {
        return
      } else {
        me.$emit('clickRow', asset)
        // TH1: không nhấn ctrl + shift thì chỉ chọn 1 row
        if (!event.ctrlKey && !event.shiftKey) {
          //kiểm tra asset có tồn tại trong selected list hay không
          let item = me.listData.find((row) => row == asset)
          if (item != undefined) {
            me.focusRow = asset
          }
        }
        // TH2: nhấn ctrl + click (không nhấn shift) thì chọn nhiều row
        if (event.ctrlKey && !event.shiftKey) {
          this.selectedList = [
            ...this.selectedList.filter((item) => item != asset),
            asset,
          ]
        }
        // TH3: nhấn shift + click (không nhấn ctrl) thì chọn nhiều row
        if (event.shiftKey && !event.ctrlKey) {
          event.preventDefault()
          const start = this.listData.indexOf(me.selectedList[0] ?? asset)
          const end = this.listData.indexOf(asset)
          const list = this.listData.slice(
            Math.min(start, end),
            Math.max(start, end) + 1
          )
          this.selectedList = list
        }
      }
    },

    /**
     * @description: Thực hiện tính toán vị trí của menu context
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 01/06/2023
     */
    handleContextMenu(asset, event) {
      event.preventDefault()
      this.focusRow = asset
      this.$nextTick(() => {
        this.menu.isShowMenu = true
        const x = event.clientX
        const y = event.clientY
        this.menu.top = y + 'px'
        this.menu.left = x + 20 + 'px'
      })
    },
  },
}
</script>
    
  <style>
@import url(@/css/components/table.css);
@import url(@/css/components/checkbox.css);
</style>