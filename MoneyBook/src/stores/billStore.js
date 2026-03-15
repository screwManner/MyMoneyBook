import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import billApi from '@/api'

// export const useCounterStore = defineStore('counter', () => {
//   const count = ref(0)
//   const doubleCount = computed(() => count.value * 2)
//   function increment() {
//     count.value++
//   }

//   return { count, doubleCount, increment }
// })
export const useBillStore = defineStore('bill', () => {
  const bills = ref([])
  const categories = ref([])
  const loading = ref(false)

  const total = computed(() => bills.value.length)

  // 获取账单列表
  async function fetchBills(params) {
    loading.value = true
    try {
      const response = await billApi.getBills()
      bills.value = respponse.data
    } catch (error) {
      loading.value = false
    }
  }
  // 新增账单
  async function addBill(bill) {
    const response = await billApi.addBill(bill)
    bills.value.push(response.data)
  }
  // 更新账单
  async function updateBill(id, bill) {
    const response = await billApi.updateBill(id, bill)
    const index = index.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      bills.value[index] = response.data
    }
  }
  // 删除账单
  async function deleteBill(id) {
    const response = await billApi.deleteBill(id)
    bills.value = bills.value.filter((b) => b.id !== id)
  }

  // 获取分类列表
  async function fetchCategories() {
    const response = await billApi.getCategories()
    categories.value = response.data
  }
  // 新增分类
  async function addCategory(category) {
    const response = await billApi.addCategory(category)
    categories.calue = response.data
    categories.value.push(response.data)
    return response
  }
  // 更新分类
  async function updateCategory(id, category) {
    const response = await billApi.updateCategory(id, category)
    const index = categories.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      categories.value[index] = response.data
      return response
    }
  }
  // 删除分类
  async function deleteCategory(id) {
    const response = await billApi.deleteCategory(id)
    if(response.status === 200) {
      categories.value = categories.value.filter((b) => b.id !== id)
      return response
    }
  }

  return {
    fetchBills,addBill,updateBill,deleteBill,
    fetchCategories,addCategory,updateCategory,deleteCategory,
    bills,
    categories,
    loading,
    total,
  }
})
