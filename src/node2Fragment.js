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
  list.forEach(node => {
    if (node.nodeType === 1) { // 标签节点
      [...node.attributes].forEach(x => {
        console.log('标签节点', x.name, x.value);
        if (x.name.startsWith('v-')) {
          const attrName = x.name.substring(2)
          if (attrName === 'if') {
            // 更新属性(包括初始化和响应式更新)
            const updateAttr = newVal => {
              let style = node.getAttribute('style')
              if (newVal) { // v-if为true时，移除style里面的display属性
                const arr = style.split(';')
                const reg = arr[arr.length - 1].includes('display') ? /display:(.)*$/ : /display:(.)*;$/
                style = style.replace(reg, '')
                style ? node.setAttribute('style', style) : node.removeAttribute('style')
              } else { // v-if的值为false时，style里面的display属性赋值为none
                style = `${style || ''}display: none;`
                node.setAttribute('style', style)
              }
            }
            updateAttr(parsePath(vm, x.value))
            node.removeAttribute(x.name)
            new Watcher(vm, x.value, newVal => updateAttr(newVal))
          }
        }
      })
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
    return cur.endsWith('()') ? (prev[cur.substring(0, cur.length - 2)])() : prev[cur]
  }, vm)
  return res
}