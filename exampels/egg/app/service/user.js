// 从 egg 上获取（推荐）
const Service = require('egg').Service
class UserService extends Service {
  // implement
  async findUser(id) {
    return {
      id
    }
  }
}
module.exports = UserService
