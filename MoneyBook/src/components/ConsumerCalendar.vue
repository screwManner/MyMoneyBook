<template>
  <div class="consumerPage">
    消费日历页面
  </div>
</template>
<script setup>
import WelcomeItem from './DetailedConsumption.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
</script>
<style lang="less" scoped>
  
</style>
