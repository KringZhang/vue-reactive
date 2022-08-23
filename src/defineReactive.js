import { Dep } from './Dep.js'
import { Watcher } from './Watcher.js'

export const observe = function (obj) {
  if (!obj || typeof obj !== 'object') return
  Object.keys(obj).forEach(key => defineReactive(obj, key))
}

export const defineReactive = function (obj, key, val) {
  arguments.length === 2 && (val = obj[key])
  observe(val)
  // data中的每一个key都对应一个独立的Dep的实例dep
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get () {
      console.log(`正在访问${key}属性`)
      Dep.target && dep.addSub(Dep.target)
      return val
    },
    set (newVal) {
      console.log(`正在改变${key}属性`)
      if (newVal !== val) {
        val = newVal
        observe(newVal)
        dep.notify()
      }
    }
  })
}