<template>
  <TreeItem
    ref="elRef"
    v-slot="{ isExpanded }"
    :value="item.value"
    :level="item.level"
    class="TreeItem"
    :class="{ 'is-dragging': isDragging }"
  >
    <span v-if="item.hasChildren" class="mdi mdi-chevron-right" :class="{ expanded: isExpanded }" />
    <span v-else class="icon-placeholder" />
    <div class="item-content">{{ item.value.title }}</div>
    <div
      v-if="instruction"
      class="instruction-overlay"
      :style="{
        left: `${instruction?.currentLevel * instruction?.indentPerLevel}px`,
        width: `calc(100% - ${instruction?.currentLevel * instruction?.indentPerLevel}px)`
      }"
      :class="{
        'border-bottom': instruction?.type === 'reorder-below',
        'border-top': instruction?.type === 'reorder-above',
        'border-all': instruction?.type === 'make-child'
      }"
    />
  </TreeItem>
</template>

<script setup lang="ts">
import { computed, h, nextTick, ref, render, watchEffect } from 'vue'
import { type FlattenedItem, TreeItem } from 'radix-vue'
import {
  draggable,
  dropTargetForElements,
  monitorForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  type Instruction,
  type ItemMode,
  attachInstruction,
  extractInstruction
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item'
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { unrefElement } from '@vueuse/core'

const props = defineProps<{
  item: FlattenedItem<any>
}>()

const elRef = ref()
const isDragging = ref(false)
const isDraggedOver = ref(false)
const isInitialExpanded = ref(false)
const instruction = ref<Extract<
  Instruction,
  { type: 'reorder-above' | 'reorder-below' | 'make-child' }
> | null>(null)

const mode = computed(() => {
  if (props.item.hasChildren) return 'expanded'
  if (props.item.index + 1 === props.item.parentItem?.children?.length) return 'last-in-group'
  return 'standard'
})

watchEffect((onCleanup) => {
  const currentElement = unrefElement(elRef)

  if (!currentElement) return

  const item = { ...props.item.value, level: props.item.level, id: props.item._id }

  const expandItem = () => {
    if (!elRef.value?.isExpanded) {
      elRef.value?.handleToggle()
    }
  }

  const closeItem = () => {
    if (elRef.value?.isExpanded) {
      elRef.value?.handleToggle()
    }
  }

  const dndFunction = combine(
    draggable({
      element: currentElement,
      getInitialData: () => item,
      onDragStart: () => {
        isDragging.value = true
        isInitialExpanded.value = elRef.value?.isExpanded
        closeItem()
      },
      onDrop: () => {
        isDragging.value = false
        if (isInitialExpanded.value) expandItem()
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
          render: ({ container }) => {
            return render(h('div', { class: 'drag-preview' }, item.id), container)
          },
          nativeSetDragImage
        })
      }
    }),

    dropTargetForElements({
      element: currentElement,
      getData: ({ input, element }) => {
        const data = { id: item.id }

        return attachInstruction(data, {
          input,
          element,
          indentPerLevel: 16,
          currentLevel: props.item.level,
          mode: mode.value,
          block: []
        })
      },
      canDrop: ({ source }) => {
        return source.data.id !== item.id
      },
      onDrag: ({ self }) => {
        instruction.value = extractInstruction(self.data) as typeof instruction.value
      },
      onDragEnter: ({ source }) => {
        if (source.data.id !== item.id) {
          isDraggedOver.value = true
          expandItem()
        }
      },
      onDragLeave: () => {
        isDraggedOver.value = false
        instruction.value = null
      },
      onDrop: ({ location }) => {
        isDraggedOver.value = false
        instruction.value = null
        if (location.current.dropTargets[0].data.id === item.id) {
          nextTick(() => {
            expandItem()
          })
        }
      },
      getIsSticky: () => true
    }),

    monitorForElements({
      canMonitor: ({ source }) => {
        return source.data.id !== item.id
      }
    })
  )

  // Cleanup dnd function
  onCleanup(() => dndFunction())
})
</script>

<style lang="scss">
.TreeItem {
  position: relative;
  width: 100%;
  border: none;

  &.is-dragging {
    opacity: 0.5;
  }
}

.icon {
  height: 1rem;
  width: 1rem;
  transition: transform 0.2s;

  &.icon-rotated {
    transform: rotate(-90deg);
  }
}

.item-content {
  padding-left: 0.5rem;
}

.instruction-overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  border-color: #0000ff;

  &.border-top {
    border-top-width: 2px;
  }

  &.border-bottom {
    border-bottom-width: 2px;
  }

  &.border-all {
    border-width: 2px;
    border-radius: 0.25rem;
  }
}

.drag-preview {
  background-color: #ffffff;
  color: #1a1a1a;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
}
</style>
