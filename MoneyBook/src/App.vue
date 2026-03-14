<template>
  <div class="appPage">
    <div class="header">
      <HeadTop />
    </div>
    <div class="container">
      <div class="sider">
        <SidderMenu />
      </div>
      <div class="contentBox">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>
<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import HeadTop from './views/HeadTop.vue'
import SidderMenu from './views/SidderMenu.vue'
import ContainerBox from './views/ContainerBox.vue'
</script>

<style scoped lang="less">
.appPage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .header {
    width: 100%;
    height: 60px;
  }
  .container {
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: row;
    justify-content: left;
    .contentBox{
      width: calc(100% - 200px);
      height: 100%;
    }
  }
}
</style>
