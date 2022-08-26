import { observe } from './defineReactive.js'
import { node2Fragment, compile } from './node2Fragment.js'
const obj = {
  name: 'zks',
  show: true,
  age: 18,
  className: 'red',
  classNameBlue: 'blue',
  arr: ['A', 'B', 'C'],
  m: {
    n: {
      o: [
        { sex: '男', hobby: '下棋', children: [ '北京' ]},
        { sex: '女', hobby: '游泳', children: [ '上海', '深圳' ] },
        { sex: '男', hobby: '打球', children: [ '武汉', '广州' ] },
      ]
    }
  },
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
    mounted()
    return this
  }
}

const vm = new myVue({
  el: '#app',
  data: obj,
  methods: {
    fn () {
      return this.age
    },
    minus (val) {
      console.log('入参val----', val)
      this.age -= val ? +val : 1
    },
    toggleTitle () {
      this.show = !this.show
    }
  },
  mounted() {
    console.log('mounted----')
    setTimeout(() => {
      vm.name='zsk'
    }, 2000);
  }
})
