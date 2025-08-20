import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import View from '../views/View.vue'
import Edit from '../views/Edit.vue'
import Manager from '../views/Manager.vue'
import Select from '../views/Select.vue'
import Introduction from '../views/Introduction.vue'

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
    path: '/edit',
    name: 'Edit',
    component: Edit
  },
  {
    path: '/manager',
    name: 'Manager',
    component: Manager
  },
  {
    path: '/select',
    name: 'Select',
    component: Select
  },
  {
    path: '/introduction',
    name: 'Introduction',
    component: Introduction
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