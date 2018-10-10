import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import routes from './routes'
import Mock from './mock'
//Mock.bootstrap();
import './assets/iconfont/iconfont.css';
import 'font-awesome/css/font-awesome.min.css';
import util from './common/js/util'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  //NProgress.start();
  
  let token = localStorage.getItem('token');
  if (to.path == '/' || (!token && to.path != '/login')) {
    next({ path: '/login' });
  } else {
    next();
  }
})

//router.afterEach(transition => {
//NProgress.done();
//});

const vm = new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

window.vm = vm