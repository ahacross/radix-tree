<template>
  <main>
    <TreeSingle v-model="data1" :defaultExpanded="['1']" />
    <br /><br /><br />
    <TreeCheckbox v-model="data2" :defaultExpanded="['1']" />
    <br /><br /><br />
    <TreeDnd v-model="data3" :defaultExpanded="['1']" />
  </main>
</template>
<script setup lang="ts">
import TreeSingle from '@/components/TreeSingle.vue'
import TreeCheckbox from '@/components/TreeCheckbox.vue'
import TreeDnd from '@/components/TreeDnD.vue'
const data1 = ref('')
const data2 = ref([])
const data3 = ref([])
</script>
