<template>
  <div class="detailed-page-container">
    <aside class="left-panel">
      <h3>消费类型列表</h3>
      <ul>
        <li v-for="(item, index) in consumeTypes" :key="index">{{ item.name }}</li>
      </ul>
    </aside>

    <section class="right-panel">
      <div class="summary">
        <div class="summary-item">
          <div class="label">{{ dateValue.dayData.date }}日</div>
          <div class="value">{{ dayNum[0]?.amount }}</div>
        </div>
        <div class="summary-item">
          <div class="label">第{{ dateValue.week.dateWeek }}周</div>
          <div class="value">{{ weekNum }}</div>
        </div>
        <div class="summary-item">
          <div class="label">{{ dateValue.month.date }}月</div>
          <div class="value">{{ monthNum }}</div>
        </div>
        <div class="summary-item">
          <div class="label">{{ dateValue.year.date }}年</div>
          <div class="value">{{ yearNum }}</div>
        </div>
      </div>

      <div class="chart-wrapper" ref="chartRef"></div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, reactive, ref, useTemplateRef,computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useBillStore } from '@/stores/billStore'
// 柱状图实例
const chartRef = useTemplateRef('chartRef')
let chartInstance = null
// 引入store
const store = useBillStore()
// 初始化时间数据
const nowDate = new Date('2026-1-12')
const dateValue = ref({
  year: {
    date: nowDate.getFullYear(),
    num: 1,
  },
  month: {
    date: nowDate.getMonth() + 1,
    num: 1,
  },
  week: {
    dateWeek: 0,
    dateList: [],
    num: 1,
  },
  dayData: {
    date: nowDate.getDate(),
    num: 1,
  },
})
// 初始化账单bill数据
const billsData = ref([])
// 初始化分类列表数据
const consumeTypes = ref([])
// 获取类型列表
const getCategoyies = async () => {
  await store.fetchCategories()
  consumeTypes.value = store.categories
}
// 获取账单列表
const getBillsData = async () => {
  await store.fetchBills()
  billsData.value = store.bills
}
// 设置消费的计算属性
const yearNum = computed(()=>{
  return billsData.value
    .filter(b => b.year === dateValue.value.year.date && b.type === 'expense')
    .reduce((sum, b) => sum + b.amount, 0)
})
const monthNum = computed(()=>{
  return billsData.value
    .filter(b => b.year === dateValue.value.year.date && b.month === dateValue.value.month.date && b.type === 'expense')
    .reduce((sum, b) => sum + b.amount, 0)
})
const weekNum = computed(()=>{
  return billsData.value
    .filter(b => b.year === dateValue.value.year.date && b.week_of_month === dateValue.value.week.dateWeek && b.type === 'expense')
    .reduce((sum, b) => sum + b.amount, 0)
})
const dayNum = computed(()=>{
  return billsData.value.filter(b => b.day === dateValue.value.dayData.date && b.type === 'expense')
})

const totals = reactive({
  daily: 520,
  weekly: 3700,
  monthly: 15800,
  yearly: 189000,
})

const chartData = reactive({
  categories: ['日', '周', '月', '年'],
  values: [totals.daily, totals.weekly, totals.monthly, totals.yearly],
})
// 根据当前日期获取处于当月的第几周和这一周内的日期
function getCurrentWeekInfo(date) {
  // 如果传入字符串，转换为Date对象
  const inputDate = typeof date === 'string' ? new Date(date) : date
  const year = inputDate.getFullYear()
  const month = inputDate.getMonth() // 0-11
  const day = inputDate.getDate()

  // 获取当月总天数
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // 确定周次
  let week
  if (day >= 1 && day <= 7) week = 1
  else if (day >= 8 && day <= 14) week = 2
  else if (day >= 15 && day <= 21) week = 3
  else if (day >= 22 && day <= 28) week = 4
  else week = 5

  // 计算该周起始日和结束日
  const startDay = (week - 1) * 7 + 1
  const endDay = Math.min(week * 7, daysInMonth)

  // 生成该周日期数组
  const weekDays = []
  for (let d = startDay; d <= endDay; d++) {
    // 注意月份要+1，因为Date对象月份从0开始
    const dateObj = new Date(year, month, d)
    // 格式化为 YYYY-MM-DD
    const yearStr = dateObj.getFullYear()
    const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0')
    const dayStr = String(dateObj.getDate()).padStart(2, '0')
    weekDays.push(`${yearStr}-${monthStr}-${dayStr}`)
  }

  dateValue.value.week.dateList = [...weekDays]
  dateValue.value.week.dateWeek = week
  // return {
  //   weekOfMonth: week,
  //   days: weekDays
  // };
}
// 处理账单和分类的数据集合
function getExpenseByCategoryWithZero(categories, bills) {
  // 1. 先筛选出所有支出分类
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // 2. 计算每个分类的支出总额
  const expenseMap = bills
    .filter(bill => bill.type === 'expense')
    .reduce((acc, bill) => {
      acc[bill.category_id] = (acc[bill.category_id] || 0) + bill.amount;
      return acc;
    }, {});

  // 3. 为每个支出分类生成结果，无支出的分类 value 为 0
  return expenseCategories.map(cat => ({
    category: cat.name,
    value: expenseMap[cat.id] || 0
  }));
}

function renderChart() {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  // 处理数据
  let template =  getExpenseByCategoryWithZero(store.categories,store.bills)
  chartData.categories = template.map(category => category.category);
  chartData.values = template.map(value => value.value)


  const option = {
    title: { text: '消费趋势（柱状图）', left: 'left', textStyle: { color: '#333' } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: chartData.categories },
    yAxis: { type: 'value', name: '金额（元）' },
    series: [
      {
        name: '消费金额',
        type: 'bar',
        data: chartData.values,
        itemStyle: {
          color: '#2f89cf',
        },
        barWidth: '40%',
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
  }

  chartInstance.setOption(option)
}

function onResize() {
  if (chartInstance) chartInstance.resize()
}

onMounted(() => {
  // 处理时间数据
  getCurrentWeekInfo(nowDate)
  // 获取分类列表
  getCategoyies()
  // 获取账单数据
  getBillsData()

  nextTick(()=>{
    renderChart()
  })
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style lang="less" scoped>
.detailed-page-container {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 70px);
  gap: 1rem;
}

.left-panel {
  width: 200px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.left-panel h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.left-panel ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.left-panel li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f4f4f4;
  color: #333;
}

.right-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
}

.summary-item {
  flex: 1;
  background: #f7fbff;
  border: 1px solid #dbe9fc;
  border-radius: 8px;
  padding: 0.8rem;
  text-align: center;
}

.summary-item .label {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 0.3rem;
}

.summary-item .value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #1f7bd8;
}

.chart-wrapper {
  flex: 1;
  min-height: 340px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 1rem;
}

.chart-wrapper .echarts-for-react,
.chart-wrapper > div {
  width: 100%;
  height: 100%;
}
</style>
