import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 消费总览页面
    {
      path: '/overView',
      name: 'overView',
      component: () => import('../components/Overview.vue'),
    },
    // 详细消费页面
    {
      path: '/detailedConsumption',
      name: 'detailedConsumption',
      component: () => import('../components/DetailedConsumption.vue'),
    },
    // 消费日历页面
    {
      path: '/consumerCalendar',
      name: 'consumerCalendar',
      component: () => import('../components/ConsumerCalendar.vue'),
    },
    // 分类页面
    {
      path: '/categoryList',
      name: 'categoryList',
      component: () => import('../components/CategoryList.vue'),
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

export default router
