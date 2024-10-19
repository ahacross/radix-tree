<template>
  <main>
    <TreeSingle v-model="data1" :defaultExpanded="['1']" />
    <br /><br /><br />
    <TreeDnd v-model="data3" :defaultExpanded="['1']" />
  </main>
</template>
<script setup lang="ts">
import TreeSingle from '@/components/tree-radix/TreeSingle.vue'
import TreeDnd from '@/components/tree-radix/TreeDnD.vue'

const data1 = ref([])
const data3 = ref([])
</script>
