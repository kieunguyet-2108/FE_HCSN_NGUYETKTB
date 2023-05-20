<template>
  <div class="input-group" v-if="type == 'text'">
    <div class="input-group__label" v-if="label">
      <label :for="name">
        {{ label }}
        <span v-if="required" class="required-sign">*</span>
      </label>
    </div>
    <div class="input-group__content">
      <input
        ref="input"
        type="type"
        autocomplete="off"
        :placeholder="placeholder"
        :class="className"
        :id="id"
        :name="name"
        :disabled="disabled"
        v-model="model"
        @input="onInputText"
        @blur="onInputText"
      />
    </div>
    <div class="input-group__error" v-if="isError">
      <div class="error-message" v-html="errorMessage"></div>
    </div>
  </div>
</template>

<script>
import validate from "@/js/validation.js";
export default {
  name: "MISAInput",
  props: {
    type: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    className: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    maxLength: {
      type: Number,
      default: 0,
    },
    minLength: {
      type: Number,
      default: 0,
    },
    isFocus: {
      type: Boolean,
      default: false,
    },
    isValidate: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isError: false,
      errorMessage: "",
    };
  },
  computed: {
    model: {
      get() {
        return this.$attrs["modelValue"];
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  mounted() {
    if (this.isFocus) {
      this.$refs.input.focus();
    }
  },
  methods: {
    /**
     * @description: Hàm xử lý khi nhập text
     * @param: {any}
     * @return: {any}
     * @author: NguyetKTB 02/05/2023
     */
    onInputText(event) {
      const me = this;
      try {
        var inputValue = event.target.value;
        if (me.isValidate) {
          if (validate.isValidLength(inputValue, me.minLength, me.maxLength)) {
            me.isError = false;
            me.errorMessage = "";
            me.$emit("update:modelValue", inputValue);
          } else if (inputValue == "") {
            me.isError = true;
            me.errorMessage = "Thông tin này không được phép để trống";
          } else {
            me.isError = true;
            me.errorMessage =
              "Độ dài của " +
              event.target.placeholder.toLowerCase() +
              " không hợp lệ";
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped>
@import url(@/css/components/input.css);
</style>