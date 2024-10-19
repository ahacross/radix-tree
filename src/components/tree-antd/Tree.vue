<template>
  <Tree
    v-bind="props"
    v-model:selectedKeys="selectedKeys"
    v-model:checkedKeys="checkedKeys"
    v-model:expandedKeys="expandedKeys"
    :tree-data="treeList"
    @drop="onDrop"
  >
    <template #title="{ title, data }">
      {{ title }}
      <span v-if="data.isMobileSupported" class="mdi mdi-alpha-m-circle" />
    </template>
  </Tree>
</template>
<script lang="ts" setup>
import { Tree } from 'ant-design-vue'
import type { AntTreeNodeDropEvent, TreeProps } from 'ant-design-vue/es/tree'
import type { Key } from 'ant-design-vue/es/vc-tree/interface'
import { addCheckableProperty, onDropEvt, type TreeData } from './utils'

interface Props extends TreeProps {
  isLeafCheckbox?: boolean // leaf만 체크박스 나오도록 속성 추가
}

// draggable: drag & drop 이동,
// checkable: checkbox 추가(하위 체크 됨),
// checkStrictly(하위/상위에 영향주지 않기),
// isLeafCheckbox(leaf만 checkbox 표시)
// fieldNames: { children: 'children', title: 'title', key: 'key' }
const props = withDefaults(defineProps<Omit<Props, 'onDrop'>>(), {
  selectable: true,
  height: 500, // virtual
  virtual: true, // virtual
  multiple: true, // 여러개 선택
  expandAction: 'click'
})

interface CheckedKey {
  checked: Key[]
  halfChecked: Key[]
}
console.log(props)

const model = defineModel<Key[]>()
const expandedKeys = ref<Key[]>(props.expandedKeys ?? [])
const selectedKeys = ref<Key[]>([])
const checkedKeys = ref<Key[] | CheckedKey>([])

const treeList = ref<TreeData>(props.treeData ?? [])

watchEffect(() => {
  props.isLeafCheckbox &&
    treeList.value.forEach((node) => addCheckableProperty(node, props.fieldNames?.children)) // leaf만 체크박스 나오도록 속성 추가
})

watch([selectedKeys, checkedKeys], () => {
  model.value = props.checkable
    ? props.checkStrictly
      ? (checkedKeys.value as CheckedKey)?.checked
      : (checkedKeys.value as Key[])
    : selectedKeys.value
})

const onDrop = (event: AntTreeNodeDropEvent) => onDropEvt(event, treeList)
</script>
