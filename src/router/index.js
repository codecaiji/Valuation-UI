import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 导入需要的组件
import ConfigsList from '@/components/ConfigsList.vue'
import ConfigsDetail from '@/components/ConfigsDetail.vue'

const router = new VueRouter({
  // 在这里声明路由规则
  routes: [
    { path: '/', redirect: '/configs' },
    { path: '/configs', component: ConfigsList },
    { path: '/configs/:id', component: ConfigsDetail, props: true },
  ],
})

export default router
