<template>
  <TreeRoot
    class="TreeRoot"
    :style="{ width }"
    :get-key="(item) => item.key"
    :items
    :defaultExpanded
    :defaultValue
    multiple
    propagate-select
    v-model="selectedNodes"
  >
    <TreeVirtualizer v-slot="{ item }" :text-content="(opt) => opt.title">
      <TreeItem
        class="TreeItem"
        :style="{ 'padding-left': `${item.level + 0.5}rem` }"
        v-bind="item.bind"
        v-slot="{ handleSelect, handleToggle, isSelected, isIndeterminate, isExpanded }"
        @select.prevent
        @toggle.prevent
      >
        <span
          v-if="item.hasChildren"
          class="mdi mdi-chevron-right"
          :class="{ expanded: isExpanded }"
          @click.stop="handleToggle"
        />
        <span v-else class="icon-placeholder" />
        <button class="checkbox" tabindex="-1" @click.stop="handleSelect">
          <span
            class="mdi"
            :class="{
              'mdi-minus-box-outline': isIndeterminate,
              'mdi-checkbox-outline': isSelected,
              'mdi-checkbox-blank-outline': !isIndeterminate && !isSelected
            }"
            style="font-size: 20px"
          />
        </button>
        <span class="pl-2" :class="{ selected: isSelected }" @click.stop="handleToggle">
          {{ item.value.title }}
          {{ `isSelected: ${isSelected}, isIndeterminate: ${isIndeterminate}` }}
        </span>
      </TreeItem>
    </TreeVirtualizer>
  </TreeRoot>
</template>

<script setup lang="ts">
import { TreeRoot, TreeItem, TreeVirtualizer } from 'radix-vue'
import { type TreeItemType } from './utils'
import type { ModelRef } from 'vue'

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
const model: ModelRef<string[] | undefined> = defineModel()
const defaultValue = props.items.flat(5).filter(({ key }) => model.value?.includes(key))
const selectedNodes = ref<TreeItemType[]>(defaultValue)

watch(
  selectedNodes,
  () => (model.value = Array.from(new Set(selectedNodes.value.map(({ key }) => key))))
)
</script>

<style lang="scss" scoped>
.TreeRoot {
  list-style-type: none;
  padding-left: 0;
  margin: 0;

  .TreeItem {
    display: flex;
    align-items: center;
    margin: 0;

    /* 기본 상태 */
    background-color: white;
    color: black;
    border-radius: 4px;
    transition:
      background-color 0.2s ease-in-out,
      color 0.2s ease-in-out;

    .icon-placeholder {
      width: 15px;
    }

    .checkbox {
      background-color: white;
      padding: 0;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: #d4f0c4; /* hover 상태 */
      }
    }

    .mdi-chevron-right {
      transition: transform 0.3s ease-in-out;
      transform: rotate(0deg); /* 기본적으로 오른쪽을 향함 */
      &.expanded {
        transform: rotate(90deg); /* 열릴 때 아래로 90도 회전 */
      }
    }

    .pl-2 {
      padding-left: 0.3rem;
      &.selected {
        background-color: rgba(122, 232, 123, 0.49);
        border-radius: 5px;
      }
    }
  }
}
</style>
