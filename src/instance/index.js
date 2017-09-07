import { observe } from '../observer/index.js'
import { initData } from './data.js'

export default class Mog {
  constructor (options) {
    this._options = options
    this._init()
  }

  _init () {
    initData(this)
  }
}

// var data = {
//   name: 'mog',
//   address: {
//     country: 'China',
//     province: 'Guangdong',
//     city: 'Shenzhen',
//     street: {
//       num: 07,
//       block: 23
//     }
//   }
// }

// function defineProxy (obj) {
//   if (!(obj !== null && typeof obj === 'object')) {
//     return obj
//   }
//   const objProxy = new Proxy(obj, {})
//   const keys = Object.keys(obj)
//   for (let key of keys) {
//     objProxy[key] = defineProxy(objProxy[key])
//   }
//   return objProxy
// }

// // defineProxy(data)
// console.log(defineProxy(data));