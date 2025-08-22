import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import View from '../views/View.vue'
import Manager from '../views/Manager.vue'
import SelectEdit from '../views/SelectEdit.vue'
import Introduction from '../views/Introduction.vue'
import AdminInit from '../views/AdminInit.vue'

console.log('开始初始化路由...')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/view',
    name: 'View',
    component: View
  },
  {
    path: '/select-edit',
    name: 'Edit',
    component: SelectEdit
  },
  {
    path: '/manager',
    name: 'Manager',
    component: Manager
  },
  {
    path: '/introduction',
    name: 'Introduction',
    component: Introduction
  },
  // 添加管理员初始化路由
  {
    path: '/admin-init',
    name: 'AdminInit',
    component: AdminInit
  },
  // 添加默认路由重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

console.log('路由初始化完成')

export default router