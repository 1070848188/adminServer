const koa = require('koa');
const Router = require('koa-router');
const KoaStatic = require('koa-static')
const jwt = require('jwt-simple');
const KoaJwt = require('koa-jwt');
const fs = require('fs');

const app = new koa()
const router = new Router()

// 处理静态资源
app.use(KoaStatic(__dirname, '/static'))

// 秘钥
const jwtSecret = 'jwtSecret'
const tokenExpiresTime = 1000 * 60 * 60 * 24 * 7

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function(ctx, next){
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = 'Protected resource, use Authorization header to get access\n';
        } else {
            throw err;
        }
    });
});

// 注册koa-jwt
app.use(KoaJwt({ secret: jwtSecret }).unless({
    path: [/^\/login/]
}))


// 登录接口
router.get('/login', async (ctx, next) => {
    let data = await fs.readFileSync('./jsons/user.json');
    data = JSON.parse(data.toString())
    const { user, password } = ctx.query;
    console.log(ctx.query);
    const userInfo = data.filter(item => item.name === user && item.password === password)[0];
    if (userInfo) {
        let payload = {
            exp: Date.now() + tokenExpiresTime,
            name: userInfo.name
        }
        let token = jwt.encode(payload, jwtSecret);
        ctx.body = {
            code: 0,
            data: { token },
            message: '登录成功'
        }
    } else {
        ctx.body = {
            code: -1,
            data: {},
            message: '用户名或密码错误，请检查无误后重新登录！'
        }
    }
    await next()
})


// 获取用户信息接口
router.get('/getInfo', async ctx => {
    let dataJson = await fs.readFileSync('./jsons/user.json');
    dataJson = JSON.parse(dataJson.toString())
    let token = ctx.header.authorization
    console.log('token', token);
    //使用jwt-simple自行解析数据
   let payload = jwt.decode(token.split(' ')[1], jwtSecret);
   console.log('用户', payload);
   const data = dataJson.filter(item => item.name === payload.name)[0];
    if(data) {
        ctx.body = {
            code: 0,
            data
        }
    } else {
        ctx.body = {
            code: -1,
            data: {},
            message: '无权限'
        } 
    }
})

// 获取角色信息
router.get('/getRoles',async ctx => {
    let data = await fs.readFileSync('./jsons/roles.json');
    data = JSON.parse(data.toString());
    ctx.body = {
        code: 0,
        data
    }
})
// 注册路由
app.use(router.routes())

// 启用端口
app.listen('3000', () => {
    console.log('服务启动成功！');
})