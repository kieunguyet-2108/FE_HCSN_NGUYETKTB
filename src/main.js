import { createApp } from "vue";
import App from "./App.vue";
import TheSideBar from "@/layouts/TheSideBar.vue";
import TheHeader from "@/layouts/TheHeader.vue";
import TheContent from "@/layouts/TheContent.vue";
import MISALoading from "@/components/base/MISALoading.vue";
import MISATooltipV1 from "@/components/base/MISATooltipV1.vue";
import router from "@/router/assetRouter.js";
import axios from "axios";
import msEnum from "@/js/enum.js";
import msDialog from "@/js/dialog.js";
import api from "@/api/api.js";
const app = createApp(App);
String.prototype.format = function() {
    let formatted = this;
    for (let i = 0; i < arguments.length; i++) {
      let regexp = new RegExp('\\{'+i+'\\}', 'gi');
      formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
  };
// Register a global component called <the-side-bar>
app.component("TheSideBar", TheSideBar);
app.component("TheHeader", TheHeader);
app.component("TheContent", TheContent);
app.component("MISALoading", MISALoading);
app.component("MISATooltipV1", MISATooltipV1);
app.use(router);
app.config.globalProperties.$msAxios = axios;
app.config.globalProperties.$msEnum = msEnum;
app.config.globalProperties.$msDialog = msDialog;
app.config.globalProperties.$msApi = api;
// app.config.globalProperties.$msCommon = msCommon;
app.mount("#app");
