import { dataBridge } from '../utils/index.js'
import { observe } from '../observer/index'

export function initData (instance) {
  let data = instance._options.data
  instance._data = data

  for (let key in data) {
    dataBridge(instance, '_data', key)
  }

  observe(data, instance)
}
