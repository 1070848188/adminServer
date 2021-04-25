const { rejects } = require('assert');
const fs = require('fs');
const jwt = require('jwt-simple');

const tokenExpiresTime = 1000 * 60 * 60 * 24 * 7
const jwtSecret = 'jwtSecret'

// 获取json数据
const getJson = async (url) => {
    let data = await fs.readFileSync(url);
    data = JSON.parse(data.toString())
    return Promise.resolve(data);
}

// 去重
const roelsDup = (arr, roles) => {
    try {
        // 获取所有权限
        let newRoles = arr.filter(item => roles.includes(item.characterCode)).map(item => item.roles);
        // 展开二维数组
        let newArr = newRoles.flat();
        // 去重
        return Array.from(new Set(newArr))
    } catch (error) {
        return []
    }

}

module.exports = {
    // 登录逻辑
    login: async (ctx, next) => {
        let data = await getJson('./jsons/user.json')
        const { user, password } = ctx.query;
        console.log(ctx.query);
        const userInfo = data.filter(item => item.name === user && item.password === password)[0];
        if (userInfo) {
            let payload = {
                exp: Date.now() + tokenExpiresTime,
                name: userInfo.code
            }
            let token = jwt.encode(payload, jwtSecret);
            ctx.body = {
                code: 0,
                data: { token, name: userInfo.name, code: userInfo.code },
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
        let userData = await getJson('./jsons/user.json')
        let rolesData = await getJson('./jsons/roles.json')
        let token = ctx.header.authorization
        //使用jwt-simple自行解析数据
        let payload = jwt.decode(token.split(' ')[1], jwtSecret);
        // 获取用户下角色
        const { roles, name } = userData.filter(item => item.code === payload.name)[0];
        // 获取角色下所有权限
        const data = roelsDup(rolesData, roles);
        if (data) {
            ctx.body = {
                code: 0,
                data : { roles: data, name}
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
        const { id, type } = ctx.request.body;
        if (type === 'add') {
            delete ctx.request.body.type;
            ctx.request.body.id = new Date().getTime() + ''
            data.push(ctx.request.body)
        } else {
            data = data.map(item => {
                if (item.id === id) {
                    return ctx.request.body;
                }
                return item
            })
        }
        await fs.writeFileSync('./jsons/roles.json', JSON.stringify(data))

        // console.log(data);
        ctx.body = {
            code: 0,
            data: {},
            message: '修改成功！'
        }
    },
    getRolesList: async ctx => {
        let userData = await getJson('./jsons/user.json')
        let rolesData = await getJson('./jsons/roles.json')
        const { userCode } = ctx.query
    }
}