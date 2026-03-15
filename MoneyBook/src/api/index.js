import axios from 'axios'

// 根据环境变量设置基础 URL，方便后期切换真实后端
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
})

export default {
  // 获取账单列表
  getBills(params) {
    return apiClient.get('/bills', { params })
  },
  //新增账单
  addBill(bill) {
    return apiClient.post('/bills', bill)
  },
  //更新账单
  updateBill(id, bill) {
    return apiClient.patch(`/bills/${id}`, bill)
  },
  //删除账单
  deleteBill(id) {
    return apiClient.delete(`/bills/${id}`)
  },

  // 获取分类列表
  getCategories() {
    return apiClient.get('/categories')
  },
  // 新增分类
  addCategory(category) {
    return apiClient.post('/categories', category)
  },
  // 更新分类
  updateCategory(id, category) {
    return apiClient.patch(`/categories/${id}`, category)
  },
  // 删除分类
  deleteCategory(id) {
    return apiClient.delete(`/categories/${id}`)
  },
}
