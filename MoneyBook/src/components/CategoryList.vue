<template>
  <div class="categoryPage">
    分类列表
    <div class="categoryHeader">
      <div class="search">
        <el-input
          v-model="input1"
          style="width: 240px"
          size="large"
          placeholder="请输入分类名称"
          :suffix-icon="Search"
        />
      </div>
      <el-button type="primary" @click="handleUpdate('新增')">新增分类</el-button>
    </div>
    <div class="categoryContent">
      <el-table :data="categoryList" border style="width: 100%">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="type" label="分类类型">
          <template #default="scope">
            <el-tag>
              {{ scope.row.type === 'expense' ? '支出' : '收入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="分类图标" />
        <el-table-column label="Operations" min-width="120">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleUpdate('编辑', scope.row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 编辑新增弹框 -->
    <el-dialog v-model="dialogFormVisible" title="分类的新增/删除" width="500">
      <el-form :model="formStateReactive">
        <el-form-item label="分类名称" :label-width="formLabelWidth">
          <el-input
            v-model="formStateReactive.name"
            placeholder="请输入分类名称"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="分类类型" :label-width="formLabelWidth">
          <el-select v-model="formStateReactive.type" placeholder="请选择分类类型">
            <el-option label="支出" value="expense" />
            <el-option label="收入" value="income" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类图标" :label-width="formLabelWidth">
          <template #default="scope">
            <span>{{ scope.row?.icon}}</span>
          </template>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogOk"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useBillStore } from '@/stores/billStore'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 引入store数据
const store = useBillStore()
// 初始化分类列表数据
const categoryList = ref([])
// 初始化弹框表单数据
const getFormState = () => {
  return {
    id: '',
    name: '',
    type: '',
    icon: '',
    order: 0,
  }
}
const formStateReactive = reactive(getFormState())
Object.assign(formStateReactive, getFormState())
// 初始化按钮操作类型
const btnTxt = ref('')
// 弹框的状态和表单的样式
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
// 获取分类列表
const getCategoryList = async () => {
  await store.fetchCategories()
  categoryList.value = store.categories
}
// 编辑分类
const handleUpdate = (txt, row) => {
  // 按钮操作类型赋值
  btnTxt.value = txt
  if (txt === '新增') {
    Object.assign(formStateReactive, getFormState())
    formStateReactive.id = 'cartTop';
    formStateReactive.order = 999;
    formStateReactive.icon = "📦"
    dialogFormVisible.value = true
  } else if (txt === '编辑') {
    Object.assign(formStateReactive, row)
    dialogFormVisible.value = true
  }
}
// 弹框确认
const dialogOk = async () => {
  // 处理确认逻辑
  if (btnTxt.value === '新增') {
    const response = await store.addCategory(formStateReactive)
    if (response.status === 201 || response.status === 200) {
      ElMessage({ type: 'success', message: '新增成功' })
      dialogFormVisible.value = false
      getCategoryList() // 刷新分类列表
    }
  } else if (btnTxt.value === '编辑') {
    const response = await store.updateCategory(formStateReactive.id, formStateReactive)
    if (response.status === 200) {
      ElMessage({ type: 'success', message: '更新成功' })
      dialogFormVisible.value = false
      getCategoryList() // 刷新分类列表
    }
  }
}
// 删除分类
const handleDelete = (row) => {
  ElMessageBox.confirm('您确认要删除当前的分类吗？', 'Warning', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // 在这里可以直接使用 row 变量
      try {
        const response = await store.deleteCategory(row.id) // 传入 row.id
        if (response.status === 200) {
          ElMessage({
            type: 'success',
            message: '删除成功',
          })
          // 可选：刷新分类列表
          getCategoryList()
        }
      } catch (error) {
        ElMessage({
          type: 'error',
          message: '删除失败',
        })
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除操作',
      })
    })
}

// 挂载执行
onMounted(() => {
  getCategoryList()
})
</script>

<style lang="less" scoped>
.categoryPage {
  width: 100%;
  height: 100%;
  .categoryHeader {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    box-sizing: border-box;
  }
  .categoryContent {
    padding: 20px;
    box-sizing: border-box;
  }
}
</style>
