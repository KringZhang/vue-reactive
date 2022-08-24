import { observe } from './defineReactive.js'
import { node2Fragment, compile } from './node2Fragment.js'
const obj = {
  name: 'zks',
  show: false,
  age: 18,
  a: {
    b: {
      c: {
        d: '真是层级很深的数据'
      }
    }
  }
}
window.obj = obj

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
  constructor ({ el, data, methods, mounted }) {
    const dom = document.querySelector(el)
    proxyData(data, this)
    proxyData(methods, this)
    observe(data)
    const fragment = node2Fragment(dom)
    compile(fragment, this)
    dom.appendChild(fragment)
    document.querySelector('#btn').addEventListener('click', () => {
      data.age++
    })
    mounted()
    return this
  }
}

const vm = new myVue({
  el: '#app',
  data: obj,
  methods: {
    fn () {
      console.log(1111)
      return this.age
    },
    minus () {
      this.age--
    }
  },
  mounted() {
    console.log('mounted----')
    setTimeout(() => {
      vm.name='zsk'
    }, 2000);
  }
})
