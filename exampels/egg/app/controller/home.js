const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    const dataList = {
      list: [
        { id: 1, title: 'this is news 1', url: '/news/1' },
        { id: 2, title: 'this is news 2', url: '/news/2' }
      ]
    }
    await this.ctx.render('index.html', dataList)
  }
  async foo() {
    this.ctx.body = {
      foo: this.app.foo,
      user: this.ctx.helper.formatUser('{"name":"Tom"}')
    }
  }
}

module.exports = HomeController
