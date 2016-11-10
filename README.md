Learn about data binding
---
I am a frontend egineer, and I've been through too many cases about "data binding". In the early days, I use `jQuery` to do so. However, everytime the data changes, I can only bind it with dom manually, if the number of data is huge, that would be very painful -- all the pain ends till I met `VueJS`.

One of the sell point about `VueJS` is "data binding". Users doesn't need to care about how the data bind to the dom, but just focus on the data, because `VueJS` would do it automatically.

Amazing, isn't it? I fell in love with `VueJS` quickly, and used it in my projects. After days, I've been familiar with its usage, and I would like to know the deep of it.

## How dose `VueJS` do the data binding?
By looking through the official document, I found that
> When you pass a plain JavaScript object to a Vue instance as its data option, Vue will walk through all of its properties and convert them to getter/setters using Object.defineProperty. 

The keyword is `Object.definProperty`. In the [MDN document](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty), it says
> The Object.defineProperty() method defines a new property directly on an object, or modifies an existing property on an object, and returns the object.

Let's make an example to test it.

First, create an Iron Man with a few properties:
```
let ironman = {
  name: 'Tony Stark',
  sex: 'male',
  age: '35'
}
```
Now, let's using `Object.defineProperty()` to change on of his property, and show out the changes from the console.

```
Object.defineProperty(ironman, 'age', {
  set (val) {
    console.log(`Set age to ${val}`)
    return val
  }
})
```
When I change his age, I would see the log:
```
ironman.age = '48'
// --> Set age to 48
```

Seems perfect, and if you change `console.log(val)` to `element.innerHTML = val`, the data binding would be done directlly, right?

Let's change Iron Man's properties a little bit:
```
let ironman = {
  name: 'Tony Stark',
  sex: 'male',
  age: '35',
  hobbies: ['girl', 'money', 'game']
}
```
Yes, he's actually a playboy. Now, I would like to add some hobbies to him, and I want to see the console output.
```
Object.defineProperty(ironman.hobbies, 'push', {
  value () {
    console.log(`Push ${arguments[0]} to ${this}`)
    this[this.length] = arguments[0]
  }
})

ironman.hobbies.push('wine')
console.log(ironman.hobbies)

// --> Push wine to girl,money,game
// --> [ 'girl', 'money', 'game', 'wine' ]
```
In the previous moment, I used `get()` to watch the object's property changes, but to an array, we can't use `get()` to watch its properties, but use `value()` instead. Though it works, but not best. Are there any idea to simplify the way that how to track the changes of an object or an array?

## In ECMA2015, `Proxy` is a good idea
What's `Proxy`? In the [MDN document](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), it says:
> The Proxy object is used to define custom behavior for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc).

`Proxy` is a new feature in ECMA2015, it's powerfull and usefull. Today I won't talk too much about it, but only one usefull usage of it. Now let's create a proxy:
```
let ironmanProxy = new Proxy(ironman, {
  set (target, property, value) {
    target[property] = value
    console.log('change....')
    return true
  }
})

ironmanProxy.age = '48'
console.log(ironman.age)

// --> change....
// --> 48
```
It works as exspect. What about `Array`?
```
let ironmanProxy = new Proxy(ironman.hobbies, {
  set (target, property, value) {
    target[property] = value
    console.log('change....')
    return true
  }
})

ironmanProxy.push('wine')
console.log(ironman.hobbies)

// --> change...
// --> change...
// --> [ 'girl', 'money', 'game', 'wine' ]
```
It works! But why does it output `change...` twice? The reason is once I trigger function `push()`, both `length` and  `body` of this array will be changed. 

## Real time data binding
Dealing with the core problem of data binding, we can think about the other problems.

Consider about a template and a data object:
```
<!-- html template -->
<p>Hello, my name is {{name}}, I enjoy eatting {{hobbies.food}}</p>

<!-- javascript -->
let ironman = {
  name: 'Tony Stark',
  sex: 'male',
  age: '35',
  hobbies: {
    food: 'banana',
    drink: 'wine'
  }
}
```
From the code above, we know that if you want to track an object's properties' changing, you should set it as the first param to the `Proxy` instance. Let's create a function to return new `Proxy` instance:
```
$setData (dataObj, fn) {
    let self = this
    let once = false
    let $d = new Proxy(dataObj, {
      set (target, property, value) {
        if (!once) {
          target[property] = value
          once = true
          /* Do something here */
        }
        return true
      }
    })
    fn($d)
  }
```

And use it like below:
```
$setData(dataObj, ($d) => {
  /* 
   * dataObj.someProps = something
   */
})

// or

$setData(dataObj.arrayProps, ($d) => {
  /* 
   * dataObj.push(something)
   */
})
```

What's more, we would like the template string point to the data object, then the string like `{{name}}` could be replaced by `Tony Stark`.
```
replaceFun(str, data) {
    let self = this
    return str.replace(/{{([^{}]*)}}/g, (a, b) => {
      return data[b]
    })
  }

replaceFun('My name is {{name}}', { name: 'xxx' })
// --> My name is xxx
```
This function works well with monolayer properties like `{ name: 'xx', age: 18 }`, but can't work with multi properties like `{ hobbies: { food: 'apple', drink: 'milk' } }`.

 For example, if the template string is `{{hobbies.food}}`, the code inside `replaceFun()` should return `data['hobbies']['food']`.

```
getObjProp (obj, propsName) {
    let propsArr = propsName.split('.')
    function rec(o, pName) {
      if (!o[pName] instanceof Array && o[pName] instanceof Object) {
        return rec(o[pName], propsArr.shift())
      }
      return o[pName]
    }
    return rec(obj, propsArr.shift())
  }

getObjProp({ data: { hobbies: { food: 'apple', drink: 'milk' } } }, 'hobbies.food')
// --> return  { food: 'apple', drink: 'milk' }
```
And the final `replaceFun()` should be like this:
```
replaceFun(str, data) {
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
```

## A data binding instance, names "Mog"
No why, just name it "Mog".
```
class Mog {
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
```
Usage:
```
<!-- html -->

    <div id="app">
      <p>
        Hello everyone, my name is <span>{{name}}</span>, I am a mini <span>{{lang}}</span> framework for just <span>{{work}}</span>. I can bind data from <span>{{supports.0}}</span>, <span>{{supports.1}}</span> and <span>{{supports.2}}</span>. What's more, I was created by <span>{{info.author}}</span>, and was written in <span>{{info.jsVersion}}</span>. My motto is "<span>{{motto}}</span>".
      </p>
    </div>
    <div id="input-wrapper">
      Motto: <input type="text" id="set-motto" autofocus>
    </div>
```

```
<!-- javascript -->

let template = document.querySelector('#app').innerHTML

let mog = new Mog({
  template: template,
  el: '#app',
  data: {
    name: 'mog',
    lang: 'javascript',
    work: 'data binding',
    supports: ['String', 'Array', 'Object'],
    info: {
      author: 'Jrain',
      jsVersion: 'Ecma2015'
    },
    motto: 'Every dog has his day'
  }
})

document.querySelector('#set-motto').oninput = (e) => {
  mog.$setData(mog.$data, ($d) => {
    $d.motto = e.target.value
  })
}
```

You can play it [HERE](http://codepen.io/jrainlau/pen/YpyBBY)

## What's more...
`Mog` is only an experiment project for learning data binding, it's not gracefull or functional enough. But this little toy helps me learnt a lot. If you are interest in it, you could fork it from [HERE](https://github.com/jrainlau/mog) and play with your idea.

Thanks for reading!
