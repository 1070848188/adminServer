const fs = require('fs');
const jwt = require('jwt-simple');

const tokenExpiresTime = 1000 * 60 * 60 * 24 * 7
const jwtSecret = 'jwtSecret'

module.exports = {
    // 登录逻辑
    login: async (ctx, next) => {
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
    },
    // 获取用户信息
    getInfo: async ctx => {
        let dataJson = await fs.readFileSync('./jsons/user.json');
        dataJson = JSON.parse(dataJson.toString())
        let token = ctx.header.authorization
        console.log('token', token);
        //使用jwt-simple自行解析数据
        let payload = jwt.decode(token.split(' ')[1], jwtSecret);
        console.log('用户', payload);
        const data = dataJson.filter(item => item.name === payload.name)[0];
        if (data) {
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
    },
    // 获取权限信息
    getRoles: async ctx => {
        let data = await fs.readFileSync('./jsons/roles.json');
        data = JSON.parse(data.toString());
        ctx.body = {
            code: 0,
            data
        }
    },
    // 修改权限信息
    setRoles: async ctx => {
        let data = await fs.readFileSync('./jsons/roles.json');
        data = JSON.parse(data.toString());
        const { characterCode, type } = ctx.request.body;
        if (type === 'add') {
            delete ctx.request.body.type;
            data.push(ctx.request.body)
        } else {
            data.forEach(item => {
                console.log(item.characterCode, characterCode);
                if (item.characterCode === characterCode) {
                    item = ctx.request.body;
                }
            })
        }
        
        await fs.writeFileSync('./jsons/roles.json', JSON.stringify(data))

        // console.log(data);
        ctx.body = {
            code: 0,
            data: {},
            message: '修改成功！'
        }
    }
}