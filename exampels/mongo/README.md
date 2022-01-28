# mongo

新建.env文件，用于存储mongodb的信息(用户名、密码等)
```env
DB_HOST=localhost
DB_PORT=27017
DB_USER=root
DB_PASS=123456
```
安装dotenv
```bash
pnpm i dotenv
```
连接mongodb
```js
const mongoose = require('mongoose')
const env = require('dotenv').config()
if (env.error) {
    throw env.error
}
const config = env.parsed
async function connect() {
    try {
        await mongoose.connect(`mongodb://localhost:27017`, {
            user: config.user,
            pass: config.pass
        })
        console.log('connect success')
    } catch (e) {
        console.log('mongoose connect error ', e)
    }
}
```