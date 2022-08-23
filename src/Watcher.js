import { Dep } from './Dep.js'
export class Watcher {
  constructor (data, key, cb) {
    this.cb = cb
    // Dep.target相当于一个全局变量，先给他赋值为watcher实例，再访问属性，从而触发依赖收集，把该watcher实例收集到dep实例的subs中
    Dep.target = this
    this.data = data
    this.key = key
    data[key]
    // 收集完依赖之后把Dep.target重置
    Dep.target = null

  }
  update () {
    this.cb(this.data[this.key])
  }
}