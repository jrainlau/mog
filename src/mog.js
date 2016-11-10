export default class Mog {
  constructor (options) {
    this.$data = options.data
    this.$el = options.el
    this.$tpl = options.template
    this._render(this.$tpl, this.$data)
  }

  $setData (dataObj, fn) {
    let self = this
    let once = false
    let $d = new Proxy(dataObj, {
      set (target, property, value) {
        if (!once) {
          target[property] = value
          once = true
          self._render(self.$tpl, self.$data)
        }
        return true
      }
    })
    fn($d)
  }

  _render (tplString, data) {
    document.querySelector(this.$el).innerHTML = this._replaceFun(tplString, data)
  }

  _replaceFun(str, data) {
    let self = this
    return str.replace(/{{([^{}]*)}}/g, (a, b) => {
      let r = self._getObjProp(data, b);
      console.log(a, b, r)
      if (typeof r === 'string' || typeof r === 'number') {
        return r
      } else {
        return self._getObjProp(r, b.split('.')[1])
      }
    })
  }

  _getObjProp (obj, propsName) {
    let propsArr = propsName.split('.')
    function rec(o, pName) {
      if (!o[pName] instanceof Array && o[pName] instanceof Object) {
        return rec(o[pName], propsArr.shift())
      }
      return o[pName]
    }
    return rec(obj, propsArr.shift())
  }

}

