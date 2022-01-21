# MongoDB

## 安装 MongoDB

### Centos 使用 yum 安装 MongoDB

安装前，先检查更新

```bash
yum update
```

创建一个/etc/yum.repos.d/mongodb-org-4.2.repo 文件

```
[mongodb-org-4.2]
name = MongoDB Repository
baseurl = https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.2/x86_64/
gpgcheck = 1
enabled = 1
gpgkey = https:// www.mongodb.org/static/pgp/server-4.2.asc
```

安装 MongoDB

```js
sudo yum install -y mongodb-org
```

如出现报错，则可能是国内的网站无法访问，需要修改镜像地址

```
[mongodb-org-4.2]
name = MongoDB Repository
baseurl = http://mirrors.aliyun.com/mongodb/yum/redhat/7Server/mongodb-org/4.2/x86_64/
gpgcheck = 0
enabled = 1
```

这里可以修改 gpgcheck=0, 省去 gpg 验证

再安装即可

```js
sudo yum install -y mongodb-org
```

查看 MongoDB 安装位置

```bash
whereis mongod
```

修改 mongoDB 配置文件

```bash
vim /etc/mongod.conf
#  如修改bindIp等 bindIp: 172.0.0.1  改为 bindIp: 0.0.0.0
```

```bash
# 启动MongoDB
systemctl start mongod.service
# 停止MongoDB
systemctl stop mongod.service
# 查看MongoDB的状态
systemctl status mongod.service
# 开启启动MongoDB
systemctl enable mongod.service
```

启动 Mongo shell

```bash
mongo
```

启动后，可以使用 MongoDB 命令

```bash
# 查看数据库
show dbs
```

添加用户

```bash
use admin
# 创建用户 user: 用户名, pwd: 用户密码,roles: 用来设置用户的权限，比如读，读写 等等
db.createUser({user: 'root', pwd: '123456', roles: ['root']})
# db.auth(用户名，用户密码)，输出1表示验证成功
db.auth('root', '123456')
```

密码验证

```bash
vim/etc/mongod.conf
```

修改配置文件

```bash
security:
  authorization: enabled
```

### windows

windows 直接下载安装即可

编写配置文件

```conf
dbpath=D:/data/data
#数据库日志存放目录
logpath=D:/data/log/mongodb.log
#以追加的方式记录日志
logappend = true
#端口号 默认为27017
port=27017
#以后台方式运行进程
#fork=true
 #开启用户认证
auth=true
#关闭http接口，默认关闭http端口访问
#httpinterface=true
#mongodb所绑定的ip地址
bind_ip = 127.0.0.1
#启用日志文件，默认启用
journal=true
#这个选项可以过滤掉一些无用的日志信息，若需要调试使用请设置为false

quiet=true
#mongod --dbpath D:/data/db
```

创建用户操作与 linux 一样

安装 windows 服务

```bash```

安装成功后 w+r 输入 services.msc 运行，可以找到安装 mongoDB 服务（mongoDB 服务可以在这设置为自启）
## 数据库
查看数据库列表
```bash
show dbs;
```
查看当前数据
```bash
db
```
切换数据库
```bash
use <dbname>
```
* admin：从权限的角度来看，这是"root"数据库。要是将一个用户添加到这个数据库，这个用户自动继承所有数据库的权限。一些特定的服务器端命令也只能从这个数据库运行，比如列出所有的数据库或者关闭服务器。
* local： 这个数据永远不会被复制，可以用来存储限于本地单台服务器的任意集合
* config：当Mongo用于分片设置时，config数据库在内部使用，用于保存分片的相关信息。

插入数据

往users集合中插入一条数据，users集合不存在会自动创建
``` js
db.users.insert({
    name: 'shibin',
    age: 12,
    sex: 'boy'
})
```
查询结合的所有数据
```js
db.users.find()
```

集合名称应以下划线或字母字符开头，并且：
* 不能包含 $
* 不能为空字符串
* 不能包含空字符
* 不能以 . 开头
* 长度限制
  * 版本 4.2 最大 120 个字节
  * 版本 4.4 最大 255 个字节

删除数据库
```js
// 必须切换到要删除的数据库上
db.drop()
```
## 集合
集合与关系型数据库中的表一样

集合不需要创建，往集合中插入一条数据时，会自动创建
```js
db.users.insert({
    name: 'shibin',
    age: 12,
    sex: 'boy'
})
```
MongoDB提供 `db.createCollection()` 方法来显式创建具有各种选项的集合，例如设置最大大小或文档验证规则。如果未指定这些选项，则无需显式创建集合，因为在首次存储集合数据时，MongoDB 会创建新集合。
``` js
db.createCollection()
```

查看集合
``` js
show collections
```
删除集合
```
db.collectionName.drop()
```

## 文档
* MongoDB 将数据记录存储为 BSON 文档
* BSON（Binary JSON）是 JSON 文档的二进制表示形式，它比 JSON 包含更多的数据类型

``` js
{
   field1: value1,
   field2: value2,
   field3: value3,
   ...
   fieldN: valueN
}
```

文档对字段名称有以下限制：
* 字段名称 `_id` 保留用作主键；它的值在集合中必须是唯一的，不可变的，并且可以是数组以外的任何类型。
* 字段名称不能包含空字符。
* 顶级字段名称不能以美元符号 `$` 开头。
  * 从 MongoDB 3.6 开始，服务器允许存储包含点 . 和美元符号 $ 的字段名称

|类型	| 整数标识符 |	别名（字符串标识符）
|--|--|--|
| Double | 	1 |	“double”|
| String	| 2 |	“string”|
| Object	| 3	| “object”|
| Array	| 4	| “array”|
| Binary data	| 5 |	“binData”|
| ObjectId	| 7 |	“objectId”|
| Boolean	| 8 |	“bool”|
| Date	| 9 |	“date”|
| Null	| 10 |	“null”|
| Regular Expression	| 11 |	“regex”|
| 32-bit integer	| 16 |	“int”|
| Timestamp	| 17 |	“timestamp”|
| 64-bit integer	| 18 |	“long”|
| Decimal128	| 19 |	“decimal”|

在 MongoDB 中，存储在集合中的每个文档都需要一个唯一的 _id 字段作为主键。如果插入的文档省略 _id 字段，则 MongoDB 驱动程序会自动为 _id 字段生成 `ObjectId`。

`_id` 字段具有以下行为和约束：

* 默认情况下，MongoDB 在创建集合时会在 `_id` 字段上创建唯一索引。
* `_id` 字段始终是文档中的第一个字段
* `_id` 字段可以包含任何 `BSON` 

### 创建文档
insert可以插入多条，也可以插入一条
```js
db.users.insert({
    name: '张Xxx',
    age: 30
})
// WriteResult({ "nInserted" : 1, "writeConcernError" : [ ] })

db.users.insert([{
    name: '张三,
    age: 30
}, {
    name: '李四',
    age: 40
}])
// 输出
// BulkWriteResult({
// 	"nRemoved" : 0,
// 	"nInserted" : 2,
// 	"nUpserted" : 0,
// 	"nMatched" : 0,
// 	"nModified" : 0,
// 	"writeErrors" : [ ]
// })

```
insertOne 插入一条
```js
db.users.insertOne({
    name: '张Xxx',
    age: 30
})
```
输出
``` json
{
    "acknowledged": true,
    "insertedId": ObjectId("61e7a21ba17e000016002e95")
}
```
insertMany 插入多条
```js
db.users.insertMany([{
    name: '张三,
    age: 30
}, {
    name: '李四',
    age: 40
}])
```
输出
```json
{
    "acknowledged": true,
    "insertedIds": [
        ObjectId("61e784a3a17e000016002e93"),
        ObjectId("61e784a3a17e000016002e94")
    ]
}
```
### 查询文档
查询所有
``` js
db.users.find()
```
查询指定字段
```js
db.users.find({}, {
    name: 1
})
```
查询不包含指定字段
```js
db.users.find({}, {
    name: 1
})
```
指定条件查询
```js
db.users.find({
  name: '张三'
})

```
多个条件查询
``` js
db.users.find({
  name: '张三',
	sex: 'boy'
})
```
指定复合查询
``` js
db.users.find({
  $or: [
    {
      age: 30
    },
     {
      sex: 'box'
    }
  ]
})
```
``` js
db.users.find({
  name: '张三',
  $or: [
    {
      sex: 'boy'
    },
     {
      sex: {
        // 小于30
        $lt: 30
      }
    }
  ]
})
```
### 查询运算符
参考：https://docs.mongodb.com/manual/reference/operator/query-comparison/
#### 比较运算符
| 名称 |	描述|
| -- |-- |
| $eq |	匹配等于指定值的值。|
| $gt |	匹配大于指定值的值。|
| $gte|	匹配大于或等于指定值的值。|
| $in	| 匹配数组中指定的任何值。|
| $lt |	匹配小于指定值的值。|
| $lte | 匹配小于或等于指定值的值。|
| $ne	| 匹配所有不等于指定值的值。|
| $nin | 不匹配数组中指定的任何值。|

#### 逻辑运算符
| 名称 |	描述|
| -- | -- |
| $and |	将查询子句与逻辑连接，并返回与这两个子句条件匹配的所有文档。|
| $not |	反转查询表达式的效果，并返回与查询表达式不匹配的文档。|
| $nor |	用逻辑NOR连接查询子句，返回所有不能匹配这两个子句的文档。|
| $or |	用逻辑连接查询子句，或返回与任一子句条件匹配的所有文档。|


### 嵌套查询
例如，以下查询选择字段大小等于文档 {h: 14, w: 21, uom: "cm"} 的所有文档：
```js
db.inventory.find({
  size: { h: 14, w: 21, uom: "cm" }
})
```

整个嵌入式文档上的相等匹配要求与指定的 `<value>` 文档完全匹配，包括字段顺序。例如，以下查询与库存收集中的任何文档都不匹配：
```js
// 顺序不对
db.inventory.find({
  size: { w: 21, h: 14, uom: "cm" }
})
```
条件查询
```js
db.inventory.find({
  "size.uom": "in"
})

db.inventory.find({
  "size.h": { $lt: 15 }
})
```
### 查询数组
先写入测试数据
```js
db.inventory.insertMany([
   { item: "journal", qty: 25, tags: ["blank", "red"], dim_cm: [ 14, 21 ] },
   { item: "notebook", qty: 50, tags: ["red", "blank"], dim_cm: [ 14, 21 ] },
   { item: "paper", qty: 100, tags: ["red", "blank", "plain"], dim_cm: [ 14, 21 ] },
   { item: "planner", qty: 75, tags: ["blank", "red"], dim_cm: [ 22.85, 30 ] },
   { item: "postcard", qty: 45, tags: ["blue"], dim_cm: [ 10, 15.25 ] }
]);
```
#### 查询数组
``` js
db.inventory.find({
    "tags": [
        "red",
        "blank"
    ]
})
```
查询数组中的顺序也必须是`["red", "blank"]`

而不考虑顺序或该数组中的其他元素，可以使用 $all 运算符
``` js
db.inventory.find({
    "tags": {
        $all: [
            "red",
            "blank"
        ]
    }
})
```
#### 查询数组中所有包含指定值元素
```js
db.inventory.find({
    tags: 'red'
})
```

#### 查询dim_cm字段包含大于25的元素
```js
db.inventory.find({
  dim_cm: { $gt: 25 }
})
```

#### 多个条件查询
查询一个元素可以满足大于 15 的条件，而另一个元素可以满足小于 25 的条件；或者单个元素可以满足以下两个条件：
```js
db.inventory.find({
    dim_cm: {
        $gt: 15,
        $lt: 25
    }
})
```
使用 $elemMatch 运算符可以在数组的元素上指定多个条件，以使至少一个数组元素满足所有指定的条件。
```js
db.inventory.find({
    dim_cm: {
        $elemMatch: {
            $gt: 15,
            $lt: 25
        }
    }
})
```

#### 通过数组索引位置查询元素
dim_cm 中第二个元素大于 25 的所有文档
```js
db.inventory.find({
    "dim_cm.1": {
        $gt: 25
    }
})
```

#### 通过数组长度查询元素
查询tags 的长度为3的元素
```js
db.inventory.find({
    "tags": {
        $size: 3
    }
})
```
### 查询嵌入文档的数组

选择库存数组中的元素与指定文档匹配的所有文档：
``` js
// 数组元素中至少有一个完全匹配，顺序必须一致
db.inventory.find({
    "instock": {
        warehouse: "A",
        qty: 5
    }
})
```
查询数组元素中qty属性包含有小于20的元素
```js
db.inventory.find({
    "instock.qty": {
        $lt: 20
    }
})
```
通过数组中是索引查询数组元素
```js
// 查询数组第0个元素的qty小于20的元素
db.inventory.find({
    "instock.0.qty": {
        $lt: 20
    }
})
```
#### 为文档数组指定多个查询条件
查询数组第0个元素的qty小于20的元素
```js
db.inventory.find({
    "instock": {
      $elemMatch: {
        qty: 5,
        warehouse: 'A'
      }
    }
})
```
查询数组中包含大于10且小于20的元素
```js
db.inventory.find({
    "instock": {
        $elemMatch: {
            qty: {
                $gt: 10,
                $lt: 20
            }
        }
    }
})
```
查询数组中元素qty的值大于10或qty的值小于20的元素（不一定是同一嵌入式文档）
```js
db.inventory.find({
    "instock.qty": {
        $gt: 10,
        $lt: 20
    }
})
```
### 指定返回字段
指定要返回的字段
``` js
db.inventory.find({}, {
    item: 1
})
```
返回除指定字段的字段
```js
// 返回除item的属性
db.inventory.find({}, {
    item: 0
})
// 返回除item、qty的属性
db.inventory.find({}, {
    item: 0,
    qty: 0
})
```
返回指定字段的嵌入式文档
```js
// 返回除item、qty的属性
db.inventory.find({}, {
    item: 1,
    'instock.qty': 1
})
```
查询数组元素中的最后一个元素
```js
db.inventory.find({}, {
    item: 0,
    instock: {
        $slice: - 1
    }
})
```
$slice 是正数，返回前 n 个元素，为负数，返回后 n 个元素
### 查询空字段或缺少字段
查询age字段为null或age字段不存在的文档
```js
db.users.find({
    age: null
})
```
查询age字段为null的字段。BSON 类型为 Null（类型编号为10）
```js
db.users.find({
    age: {
        $type: 10
    }
})
```
查询不存在的文档
```js
db.users.find({
    age: {
        $exits: false
    }
})
```
## 更新文档
MongoDB提供了下面三个更新方法
* db.collection.updateOne(`<filter>`,` <update>`, `<options>`)
* db.collection.updateMany(`<filter>`, `<update>`, `<options>`)
* db.collection.replaceOne(`<filter>`, `<update>`, `<options>`)

第一个参数表示条件，第二个参数表格更新的操作
### 更新一个文档
```js
db.inventory.updateOne(
    {
        item: "paper"
    },
    {
        $set: {
            "size.uom": "cm",
            status: "P"
        },
        $currentDate: {
            lastModified: true
        }
    }
)
```
* $set 运算符用来
* 使用 $currentDate 运算符将 lastModified 字段的值更新为当前日期。如果 lastModified 字段不存在，则 $currentDate 将创建该字段。

### 更新多个文档
```js
db.inventory.updateOne(
    {
        item: "paper"
    },
    {
        $set: {
            "size.uom": "cm",
            status: "P"
        },
        $currentDate: {
            lastModified: true
        }
    }
)
```
### 更新多个文档
```js
// 会将所有item值为paper的文档设置size.uom为cm,status更新为P
db.inventory.updatemany(
    {
        item: "paper"
    },
    {
        $set: {
            "size.uom": "cm",
            status: "P"
        },
        $currentDate: {
            lastModified: true
        }
    }
)
```
### 替换文档
```js
// 会将该文档全部替换为第二个参数的内容
db.inventory.replaceOne(
    {
        item: "journal"
    },
    {
			a:123,
			 item: "journal"
    }
)

```
## 删除文档
* db.collection.deleteMany()，删除多个文档
* db.collection.deleteOne()， 删除单个文档


### 删除单个文档
```js
// 删除第一个name为张三的数据
db.users.deleteOne({
    name: '张三'
})
```
### 删除多个文档
```js
// 删除所有name为张三的数据
db.users.deleteMany({
    name: '张三'
})
```