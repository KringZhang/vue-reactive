export class Dep {
  static target = null
  constructor () {
    // 此数组中的每一项都是watcher的实例
    this.subs = []
  }
  // 往this.subs数组中添加一个watcher实例
  addSub (sub) {
    this.subs.push(sub)
  }
  // 通知订阅器里面的每一个watcher更新
  notify () {
    this.subs.forEach(x => x.update())
  }
}