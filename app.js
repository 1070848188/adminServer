const koa = require('koa');
const Router = require('koa-router');
const KoaStatic = require('koa-static')
const KoaJwt = require('koa-jwt');
const bodyParser = require('koa-bodyparser');
const userControls = require('./controls/user')

const app = new koa()
const router = new Router()

// 处理静态资源
app.use(KoaStatic(__dirname, '/static'))

// 秘钥
const jwtSecret = 'jwtSecret'

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
router.get('/login', userControls.login)

// 获取用户信息接口
router.get('/getInfo', userControls.getInfo)

// 获取角色信息
router.get('/getRoles', userControls.getRoles)

// 修改权限信息
router.post('/setRoles', userControls.setRoles)

// 获取权限列表
router.get('/getRolesList', userControls.getRolesList)

app.use(bodyParser()); 

// 注册路由
app.use(router.routes())

app.use(router.allowedMethods())

// 启用端口
app.listen('3000', () => {
    console.log('服务启动成功！');
})