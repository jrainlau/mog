import Mog from './instance/index.js'

const mog = new Mog({
  data: {
    name: 'Jrain',
    address: {
      country: 'China',
      province: 'Guangdong',
      city: 'Shenzhen',
      street: {
        num: 7,
        block: 23
      }
    }
  }
})

window.mog = mog