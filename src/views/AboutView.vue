<template>
  <div class="about">
    <Tree v-model="data" :treeData checkable :expanded-keys="['0-0']" @onCheck="onCheck" />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
<script setup lang="ts">
import Tree from '@/components/tree-antd/Tree.vue'

const treeData = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        children: [
          { title: 'leaf1', key: '0-0-0-0', isMobileSupported: 123 },
          { title: 'leaf2', key: '0-0-0-1' }
        ]
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [{ key: '0-0-1-0', title: 'sss' }]
      }
    ]
  }
]

const data = ref<string[]>([])
watch(data, () => {
  console.log(data.value)
})

const onCheck = (checkedKeys: string[]) => {
  console.log('onCheck', checkedKeys)
}
</script>
