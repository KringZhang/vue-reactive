import { observe } from './defineReactive.js'
import { Watcher } from './Watcher.js'
const obj = {
  name: 'zks',
  age: 18,
  a: {
    b: {
      c: {
        d: {}
      }
    }
  }
}
window.obj = obj

const initWatcher = (data, key, el) => {
  new Watcher(data, key, newVal => {
    console.log(data, key, '更新操作,更新后的值是：', newVal)
    el.innerText = newVal
  })
}

// 代理data到this上
const proxyData = (data, vm) => {
  Object.keys(data).forEach(key => {
    Object.defineProperty(vm, key, {
      get () {
        return data[key]
      },
      set (newVal) {
        data[key] = newVal
      }
    })
  })
}

class myVue {
  constructor ({ el, data, mounted }) {
    proxyData(data, this)
    observe(data)
    initWatcher(data, 'name', el)
    mounted()
    console.log(this)
    return this
  }
}

const vm = new myVue({
  el: document.querySelector('#box'),
  data: obj,
  mounted() {
    console.log('mounted----')
    setTimeout(() => {
      vm.name='zsk'
    }, 2000);
  }
})
