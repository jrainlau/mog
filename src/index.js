import Mog from './mog.js'

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
