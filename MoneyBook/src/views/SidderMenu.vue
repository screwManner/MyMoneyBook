<template>
  <div class="sidderPage">
    <el-row class="tac">
      <el-col :span="24">
        <el-menu
          default-active="/overView"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          :router="true"
        >
          <el-menu-item index="/overView">
            <el-icon><location /></el-icon>
            <span>账户消费总览</span>
          </el-menu-item>
          <el-menu-item index="/consumerCalendar">
            <el-icon><icon-menu /></el-icon>
            <span>本月消费日历</span>
          </el-menu-item>
          <el-menu-item index="/detailedConsumption">
            <el-icon><document /></el-icon>
            <span>详细消费</span>
          </el-menu-item>
          <el-menu-item index="/categoryList">
            <el-icon><setting /></el-icon>
            <span>分类编辑</span>
          </el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'

// const handleItemClick = (index) => {
//   console.log('菜单被点击了',index)
// }

const handleOpen = (key, keyPath) => {
  console.log('open',key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
</script>
<style scoped lang="less">
.sidderPage {
  width: 200px;
  height: 100%;
  background-color: #f0f0f0;
}
</style>
