import { Dep } from './Dep.js'
import { parsePath } from './node2Fragment.js'
export class Watcher {
  constructor (vm, key, cb) {
    this.cb = cb
    // Dep.target相当于一个全局变量，先给他赋值为watcher实例，再访问属性，从而触发依赖收集，把该watcher实例收集到dep实例的subs中
    Dep.target = this
    this.vm = vm
    this.key = key
    parsePath(vm, key)
    // 收集完依赖之后把Dep.target重置
    Dep.target = null
  }
  update () {
    this.cb(parsePath(this.vm, this.key))
  }
}