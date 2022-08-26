import { compile, parsePath } from './node2Fragment'
import { Watcher } from "./Watcher"

// 编译节点类型(主要是指令)
export const compileNode = (node, vm, stack) => {
  let vFor
  // 存当前节点未编译之前的子节点
  let unCompiledChildNodes = '';
  [...node.attributes].forEach(x => {
    if (x.name.startsWith('@')) {
      const eventKey = x.name.substring(1)
      handleOn(vm, node, x, eventKey)
    } else if (x.name.startsWith(':')) {
      const key = x.name.substring(1)
      handleBind(vm, node, x, key)
    } else if (x.name.startsWith('v-')) {
      const attrName = x.name.substring(2)
      if (['if', 'show'].includes(attrName)) { // v-if  v-show
        updateAttr(node, x, parsePath(vm, x.value), stack)
        new Watcher(vm, x.value, newVal => updateAttr(node, x, newVal))
      } else if (attrName.startsWith('else-if')) {
        // TODO
        stack.push(x.value)
      } else if (attrName.startsWith('else')) { // v-else
        if (!stack.length) return console.error('v-else找不到匹配的v-if')
        // 拿到stack数组里面的每一项的布尔值，并且用||计算结果，然后取反
        const calcFlag = stack.reduce((prev, cur) => prev || parsePath(vm, cur), false)
        if (calcFlag) { // 命中的是前面的v-if或者v-else-if
          updateAttr(node, x, false, stack)
        } else { // 命中的是v-else
          updateAttr(node, x, true, stack)
        }
        new Watcher(vm, stack[0], newVal => updateAttr(node, x, !newVal))
        stack.splice(0, stack.length)
      } else if (attrName.startsWith('for')) { // v-for
        let [item, listName] = x.value.split(' in ')
        const list = parsePath(vm, listName) || []
        vm[item] = list[0]
        vFor = x
        unCompiledChildNodes = node.childNodes.length ? [...node.childNodes].map(i => i.cloneNode(true)) : []
        console.log('unCompiledChildNodes===', unCompiledChildNodes)
      } else if (attrName.startsWith('bind:')) {
        const key = attrName.substring(5)
        handleBind(vm, node, x, key)
      } else if (attrName.startsWith('on:')) {
        const eventKey = attrName.substring(3)
        handleOn(vm, node, x, eventKey)
      }
    }
    node.removeAttribute(x.name)
  })
  compile(node, vm)
  vFor && cb(vm, node, vFor, stack, unCompiledChildNodes)
}

// 处理通过v-for循环出来的节点
function cb (vm, node, vFor, stack, unCompiledChildNodes) {
  let [item, listName] = vFor.value.split(' in ')
  const list = parsePath(vm, listName) || []
  const tagName = node.tagName.toLowerCase()
  // v-for遍历出来的节点要插入的位置
  const pos = node.nextSibling || null
  list.forEach((y, yIdx) => {
    if (yIdx) { // yIdx从1开始
      vm[item] = y
      const dom = document.createElement(tagName);
      // 把当前节点的属性复制到每一个新创建的节点上面
      [...node.attributes].forEach(z => {
        z.name !== 'v-for' && dom.setAttribute(z.name, z.value)
      });
      unCompiledChildNodes.forEach(z => {
        dom.appendChild(z.cloneNode(true))
      })
      node.parentNode.insertBefore(dom, pos)
      compileNode(dom, vm, stack)
    }
  })
  // v-for区域结束之后，释放掉局部变量
  delete vm[item]
}

// 编译v-if v-else v-show(包括初始化和响应式更新)
function updateAttr (node, x, newVal, stack) {
  const attrName = x.name.substring(2)
  let style = node.getAttribute('style') || ''
  if (newVal) { // 为true时，移除style里面的display属性
    const arr = style.split(';')
    let reg
    if (['if', 'else'].includes(attrName)) {
      // 初始化时：碰到v-if时重置栈为当前条件。注：此处不能用stack=parsePath(vm, x.value)，那样会消除引用关系
      stack && stack.splice(0, stack.length, x.value)
      reg = arr[arr.length - 1].includes('display') ? /display:(.)*$/ : /display:(.)*;$/
    } else if (attrName === 'show') {
      reg = arr[arr.length - 1].includes('visibility') ? /visibility:(.)*$/ : /visibility:(.)*;$/
    }
    style = style.replace(reg, '')
    style ? node.setAttribute('style', style) : node.removeAttribute('style')
  } else { // 值为false时，style里面的display属性赋值为none
    style = ['if', 'else'].includes(attrName) ? `${style || ''}display: none;` : `${style || ''}visibility: hidden;`
    node.setAttribute('style', style)
  }
}

// 指令v-on和@的编译
function handleOn (vm, node, x, eventKey) {
  const reg = /(.+)\((.*)\)$/
  const matchResult = x.value.match(reg)
  let [eventVal, params] = [x.value, ['']]
  if (matchResult) { // 如果有() eventVal取()之前的部分，同时把入参取出来放到params里
    eventVal = matchResult[1]
    params = matchResult[2].split(',')
  }
  node.addEventListener(eventKey, vm[eventVal].bind(vm, ...params))
}

// 指令v-bind和:的编译
function handleBind (vm, node, x, key) {
  const updateAttr = newVal => node.setAttribute(key, newVal)
  updateAttr(parsePath(vm, x.value))
  new Watcher(vm, x.value, newVal => updateAttr(newVal))
}