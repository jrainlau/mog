import { isObject } from '../utils/index.js'

export function observe (data, instance) {
  if (!isObject(data)) {
    return
  }
  return new Observer(data, instance)
}

export default class Observer {
  constructor (data, instance) {
    this._data = defineProxy(data)
    if (instance) {
      instance._data = this._data
    }
  }
}

export function defineProxy (obj) {
  if (!(obj !== null && typeof obj === 'object')) {
    return obj
  }
  const objProxy = new Proxy(obj, { set, get })
  const keys = Object.keys(obj)
  for (let key of keys) {
    objProxy[key] = defineProxy(objProxy[key])
  }
  return objProxy
}

function set (target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver)
  // dep
  console.log('Set() triggered! ' + key);
  return result
}

function get (target, key, value, receiver) {
  const result = Reflect.get(target, key, value, receiver)
  // dep
  console.log('Get() triggered! ' + key);
  return result
}