export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

export function noop () {}

export function dataBridge (target, bridge, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get () {
      return this[bridge][key]
    },
    set (val) {
      this[bridge][key] = val
    }
  })
}