<template>
  <TreeRoot
    class="TreeRoot"
    :items="dndItems"
    :get-key="(item) => item.key"
    multiple
    propagate-select
  >
    <TreeVirtualizer v-slot="{ item }" :text-content="(opt) => opt.title">
      <TreeItem
        class="TreeItem"
        :item="item"
        v-bind="item.bind"
        :style="{ paddingLeft: `${item.level}rem` }"
        @select.prevent
      />
    </TreeVirtualizer>
  </TreeRoot>
</template>

<script setup lang="ts">
import { TreeRoot, TreeVirtualizer } from 'radix-vue'
import TreeItem from './TreeItemDnD.vue'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  type Instruction,
  extractInstruction
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item'
import { updateTree, type TreeItemType } from './utils'

const props = withDefaults(
  defineProps<{
    items?: TreeItemType[]
    defaultExpanded?: string[]
    width?: string
  }>(),
  {
    items: () => [
      {
        key: '1',
        title: '루트1',
        children: [
          {
            key: '1-1',
            title: '자식1-1',
            children: [
              { key: '1-1-1', title: '자식1-1-1' },
              { key: '1-1-2', title: '자식1-1-2' }
            ]
          },
          { key: '1-2', title: '자식1-2' }
        ]
      },
      {
        key: '2',
        title: '루트2',
        children: [
          { key: '2-1', title: '자식2-1' },
          { key: '2-2', title: '자식2-2' }
        ]
      }
    ],
    defaultExpanded: () => [],
    width: '50vw'
  }
)

const dndItems = ref(props.items)

watchEffect((onCleanup) => {
  const dndFunction = combine(
    monitorForElements({
      onDrop(args) {
        const { location, source } = args
        // didn't drop on anything
        if (!location.current.dropTargets.length) return

        const itemId = source.data.id as string
        const target = location.current.dropTargets[0]
        const targetId = target.data.id as string

        const instruction: Instruction | null = extractInstruction(target.data)

        console.log('onDrop 호출됨', args)

        if (instruction !== null) {
          dndItems.value =
            updateTree(dndItems.value, {
              type: 'instruction',
              instruction,
              itemId,
              targetId
            }) ?? []

          console.log('업데이트된 items:', dndItems.value)
        }
      }
    })
  )

  onCleanup(() => {
    dndFunction()
  })
})
</script>

<style lang="scss">
.container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.TreeRoot {
  list-style: none;
  user-select: none;
  width: 16rem;
  background-color: #ffffff;
  color: #1a1a1a;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.TreeItem {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  outline: none;

  &:focus {
    /* Corrected focus ring using box-shadow */
    box-shadow: 0 0 0 2px #32cd32;
  }

  &.selected {
    background-color: #d4f8d4;
  }
}
</style>
