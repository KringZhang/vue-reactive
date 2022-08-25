import { compileNode } from "./compileNode"
import { Watcher } from "./Watcher"

export const node2Fragment = (dom) => {
  const fragment = document.createDocumentFragment()
  let firstCh = ''
  while (firstCh = dom.firstChild) {
    fragment.appendChild(firstCh)
  }
  return fragment
}

export const compile = (fragment, vm) => {
  const list = fragment?.childNodes?.length ? [...fragment.childNodes] : []
  // v-if、v-else-if时把条件入栈，v-else时出栈
  let stack = []
  list.forEach(node => {
    if (node.nodeType === 1) { // 标签节点
      compileNode(node, vm, stack)
      compile(node, vm)
    } else if (node.nodeType === 3) { // 文本节点
      const matchReg = /\{\{([^\}]+)\}\}/g
      const replaceReg = /\{\{([^\}]+)\}\}/
      let { textContent } = node
      let str = textContent
      const arr = textContent.match(matchReg)
      if (arr?.length) { // arr ---> ['{{name}}', '{{age}}', '{{a.b.c.d}}']
        const tempArr = []
        arr.forEach((x, idx) => {
          const key = x.substring(2, x.length - 2)
          new Watcher(vm, key, newVal => {
            // tempArr存放所有匹配到的{{}}对应的数据值，更新的时候先用当前要更新的元素的值替换掉对应的位置，然后依次更新模板
            tempArr.splice(idx, 1, newVal)
            str = textContent // 重置str为带有{{}}的模板
            tempArr.forEach((y, yIdx) => str = str.replace(replaceReg, tempArr[yIdx]))
            node.textContent = str
          })
          node.textContent = str = str.replace(replaceReg, parsePath(vm, key))
          tempArr.push(parsePath(vm, key))
        })
      }
    }
  })
}

// 可以解析带有.的字符串key
export function parsePath (vm, key) {
  const keyArr = key.split('.')
  const res = keyArr.reduce((prev, cur) => {
    // 考虑到{{}}里面是方法的场景(以()结束)
    // if (cur.endsWith('()')) {
    //   return (prev[cur.substring(0, cur.length - 2)])()
    // } else if (cur in prev) {
    //   return prev[cur]
    // } else {
    //   return cur
    // }
    return cur.endsWith('()') ? (prev[cur.substring(0, cur.length - 2)])() : prev[cur]
  }, vm)
  return res
}