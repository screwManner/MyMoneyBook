<template>
  <div class="consumer-page-container">
    <el-card class="consumer-tabs-card" shadow="hover">
      <el-tabs v-model:model-value="activeTab" type="card">
        <el-tab-pane label="日历查看" name="calendar">
          <div class="calendar-wrapper">
            <el-calendar v-model:model-value="calendarDate" :first-day-of-week="1" @panel-change="handlePanelChange">
              <template #dateCell="{ date }">
                <div class="calendar-date-cell" @click="showDayDetail(date)">
                  <div class="top-day">{{ date.getDate() }}</div>
                  <div class="summary-line">
                    <span>当日消费：{{ daySummary(date).expense.toFixed(2) | 0 }}</span>
                  </div>
                </div>
              </template>
            </el-calendar>
          </div>

          <el-dialog :model-value="detailDialogVisible" width="60%" :title="`${selectedDateText} 明细`" @close="detailDialogVisible = false">
            <el-table :data="selectedDateBills" style="width: 100%" border>
              <el-table-column type="index" label="序号" width="70" />
              <el-table-column prop="category_id" label="分类" :formatter="formatCategoryName" />
              <el-table-column prop="type" label="类型" />
              <el-table-column prop="amount" label="金额" />
              <el-table-column prop="note" label="备注" />
              <el-table-column prop="week_of_month" label="周" width="90" />
            </el-table>
            <template #footer>
              <span>合计支出：{{ selectedExpenseTotal.toFixed(2) }}；合计收入：{{ selectedIncomeTotal.toFixed(2) }}</span>
            </template>
          </el-dialog>
        </el-tab-pane>

        <el-tab-pane label="表格管理" name="table">
          <div class="table-action-row">
            <el-input v-model="searchQuery" placeholder="搜索：备注/分类" clearable style="width: 260px" />
            <el-button type="primary" @click="openAddDialog">新增账单</el-button>
          </div>

          <el-table :data="filteredBills" border style="width: 100%" height="450">
            <el-table-column prop="id" label="ID" width="120" />
            <el-table-column prop="year" label="年" width="80" />
            <el-table-column prop="month" label="月" width="80" />
            <el-table-column prop="day" label="日" width="80" />
            <el-table-column prop="category_id" label="分类" :formatter="formatCategoryName" />
            <el-table-column prop="type" label="类型" width="90" />
            <el-table-column prop="amount" label="金额" width="120" />
            <el-table-column prop="note" label="备注" />
            <el-table-column label="操作" width="170">
              <template #default="{ row }">
                <el-button type="primary" size="mini" @click="openEditDialog(row)">编辑</el-button>
                <el-button type="danger" size="mini" @click="deleteBill(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-dialog :model-value="formDialogVisible" title="账单信息" width="500px" @close="resetForm">
            <el-form :model="billForm" ref="billFormRef" :label-width="'90px'">
              <el-form-item label="日期" required>
                <el-date-picker v-model="billDate" type="date" placeholder="选择日期" style="width: 100%" @change="updateDateFromBillDate" />
              </el-form-item>

              <el-form-item label="分类" required>
                <el-select v-model="billForm.category_id" placeholder="选择分类">
                  <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
                </el-select>
              </el-form-item>

              <el-form-item label="类型" required>
                <el-radio-group v-model="billForm.type">
                  <el-radio label="expense">支出</el-radio>
                  <el-radio label="income">收入</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="金额" required>
                <el-input-number v-model="billForm.amount" :min="0" :step="0.01" style="width: 100%" />
              </el-form-item>

              <el-form-item label="备注">
                <el-input v-model="billForm.note" placeholder="备注信息" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitBillForm">保存</el-button>
                <el-button @click="formDialogVisible = false">取消</el-button>
              </el-form-item>
            </el-form>
          </el-dialog>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue'
import { useBillStore } from '@/stores/billStore'

// Pinia 账单状态仓库
const store = useBillStore()

// 当前选中 Tab，可选值：calendar/table
const activeTab = ref('calendar')

// 日历当前选中日期（用于展示日历面板）
const calendarDate = ref(new Date())
// 点击日期后，格式化日期字符串（YYYY-MM-DD）
const selectedDate = ref('')
// 显示在详情弹框标题的日期
const selectedDateText = ref('')
// 详情弹框可见性控制
const detailDialogVisible = ref(false)

// 表格管理页搜索关键字
const searchQuery = ref('')
// 表单对话框可见性控制
const formDialogVisible = ref(false)
// 编辑模式标记（false=新增、true=编辑）
const isEditMode = ref(false)

// 从 Pinia 读取分类和账单数据
const categories = computed(() => store.categories)
const bills = computed(() => store.bills)

const billFormRef = ref(null)

const billDate = ref(new Date())

const billForm = reactive({
  id: '',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  day: new Date().getDate(),
  week_of_month: 1,
  category_id: '',
  type: 'expense',
  amount: 0,
  note: '',
})

// 将 Date 对象或日期字符串转为标准 YYYY-MM-DD，用于 map 键值匹配
const formatDateKey = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

// 依据日期计算当月第几周（1~5）
const getWeekOfMonth = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  const day = d.getDate()
  if (day <= 7) return 1
  if (day <= 14) return 2
  if (day <= 21) return 3
  if (day <= 28) return 4
  return 5
}

// 生成每个日期的收入 / 支出汇总，用于日历日期单元格显示
const dateSummaryMap = computed(() => {
  const map = {}
  bills.value.forEach((bill) => {
    const key = `${bill.year}-${String(bill.month).padStart(2, '0')}-${String(bill.day).padStart(2, '0')}`
    if (!map[key]) {
      map[key] = { expense: 0, income: 0 }
    }
    if (bill.type === 'expense') map[key].expense += Number(bill.amount)
    if (bill.type === 'income') map[key].income += Number(bill.amount)
  })
  return map
})

const daySummary = (date) => {
  const key = formatDateKey(date)
  return dateSummaryMap.value[key] || { expense: 0, income: 0 }
}

// 选中日期的账单明细列表，用于弹窗表格
const selectedDateBills = computed(() => {
  if (!selectedDate.value) return []
  return bills.value.filter((b) => {
    const key = `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`
    return key === selectedDate.value
  })
})

// 选中日期总支出/总收入
const selectedExpenseTotal = computed(() => selectedDateBills.value.filter((b) => b.type === 'expense').reduce((sum, bill) => sum + Number(bill.amount), 0))
const selectedIncomeTotal = computed(() => selectedDateBills.value.filter((b) => b.type === 'income').reduce((sum, bill) => sum + Number(bill.amount), 0))

// 分类 id 转名称显示
const formatCategoryName = (row) => {
  const cat = categories.value.find((c) => c.id === row.category_id || c.id === row)
  return cat ? cat.name : '--'
}

// 根据搜索关键词筛选表格账单
const filteredBills = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return bills.value
  return bills.value.filter((bill) => {
    const catName = formatCategoryName(bill)
    return (
      String(bill.note || '').toLowerCase().includes(keyword) ||
      String(catName || '').toLowerCase().includes(keyword)
    )
  })
})

// 日历单元格点击：显示当日明细弹框
const showDayDetail = (date) => {
  selectedDate.value = formatDateKey(date)
  selectedDateText.value = selectedDate.value
  detailDialogVisible.value = true
}

// 新增账单按钮，打开表单弹窗
const openAddDialog = () => {
  isEditMode.value = false
  resetForm()
  billDate.value = new Date()
  formDialogVisible.value = true
}

// 编辑某一条账单时，加载数据到表单
const openEditDialog = (row) => {
  isEditMode.value = true
  billForm.id = row.id
  billForm.year = row.year
  billForm.month = row.month
  billForm.day = row.day
  billForm.week_of_month = row.week_of_month
  billForm.category_id = row.category_id
  billForm.type = row.type
  billForm.amount = row.amount
  billForm.note = row.note
  billDate.value = new Date(row.year, row.month - 1, row.day)
  formDialogVisible.value = true
}

// 日期选择器选中时，同步到表单日期字段（含周计算）
const updateDateFromBillDate = (date) => {
  if (!date) return
  billForm.year = date.getFullYear()
  billForm.month = date.getMonth() + 1
  billForm.day = date.getDate()
  billForm.week_of_month = getWeekOfMonth(date)
}

// 重置表单为默认值
const resetForm = () => {
  billForm.id = ''
  billForm.year = new Date().getFullYear()
  billForm.month = new Date().getMonth() + 1
  billForm.day = new Date().getDate()
  billForm.week_of_month = getWeekOfMonth(new Date())
  billForm.category_id = ''
  billForm.type = 'expense'
  billForm.amount = 0
  billForm.note = ''
  billDate.value = new Date()
  formDialogVisible.value = false
}

// 保存账单（新增/编辑）
const submitBillForm = async () => {
  if (!billForm.category_id) {
    return
  }
  const payload = {
    year: billForm.year,
    month: billForm.month,
    day: billForm.day,
    week_of_month: billForm.week_of_month,
    category_id: billForm.category_id,
    type: billForm.type,
    amount: Number(billForm.amount),
    note: billForm.note,
  }

  try {
    if (isEditMode.value && billForm.id) {
      await store.updateBill(billForm.id, payload)
    } else {
      const id = `b_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      const newBill = { id, ...payload }
      await store.addBill(newBill)
    }
  } catch (error) {
    console.error('保存账单失败', error)
  } finally {
    formDialogVisible.value = false
    resetForm()
  }
}

// 删除账单操作（从 store 中删除）
const deleteBill = async (row) => {
  try {
    await store.deleteBill(row.id)
  } catch (error) {
    console.error('删除账单失败', error)
  }
}

// 日历组件切换面板（按月切换）时更新当前日期变量
const handlePanelChange = ({ date }) => {
  calendarDate.value = date
}

onMounted(async () => {
  await store.fetchCategories()
  await store.fetchBills()
})
</script>

<style lang="less" scoped>
.consumer-page-container {
  padding: 16px;
}

.consumer-tabs-card {
  border-radius: 8px;
}

.calendar-wrapper {
  margin-top: 16px;
}

.calendar-date-cell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 68px;
  width: 100%;
  cursor: pointer;
}

.top-day {
  font-weight: bold;
}

.summary-line {
  margin-top: 4px;
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.table-action-row {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
