import type { AntTreeNodeDropEvent, DataNode } from 'ant-design-vue/es/tree'

export type TreeData = DataNode[]
// data에 checkable 속성 추가
export function addCheckableProperty(node: DataNode, childrenKey: string = 'children') {
  // children이 있는 경우 checkable: true, 없는 경우 checkable: false 추가
  if (node?.[childrenKey]?.length > 0) {
    node.checkable = false
    // 자식 노드에 대해 재귀 호출
    node[childrenKey].forEach((child: DataNode) => addCheckableProperty(child, childrenKey))
  } else {
    node.checkable = true
  }
}

const loop = (
  data: TreeData,
  key: string | number,
  callback: (item: DataNode, index: number, arr: TreeData) => void
) => {
  data.forEach((item, index) => {
    if (item.key === key) {
      return callback(item, index, data)
    }
    if (item.children) {
      return loop(item.children as TreeData, key, callback)
    }
  })
}

export const onDropEvt = (info: AntTreeNodeDropEvent, treeList: Ref<TreeData>) => {
  const dropKey = info.node.key
  const dragKey = info.dragNode.key
  const dropPos = info.node.pos!.split('-')
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

  const data = [...treeList.value]

  // Find dragObject
  let dragObj: DataNode | undefined
  loop(data, dragKey, (item: DataNode, index: number, arr: TreeData) => {
    arr!.splice(index, 1)
    dragObj = item
  })

  if (!dragObj) return

  if (!info.dropToGap) {
    // Drop on the content
    loop(data, dropKey, (item: DataNode) => {
      item.children = item.children || []
      item.children.unshift(dragObj!)
    })
  } else if (
    (info.node.children || []).length > 0 && // Has children
    info.node.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    loop(data, dropKey, (item: DataNode) => {
      item.children = item.children || []
      item.children.unshift(dragObj!)
    })
  } else {
    let ar: TreeData = []
    let i = 0
    loop(data, dropKey, (_item: DataNode, index: number, arr: TreeData) => {
      ar = arr
      i = index
    })
    if (dropPosition === -1) {
      ar.splice(i, 0, dragObj)
    } else {
      ar.splice(i + 1, 0, dragObj)
    }
  }
  treeList.value = data
}
