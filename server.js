// 导入WebSocket模块:
const WebSocket = require('ws');
// 引用Server类:
const WebSocketServer = WebSocket.Server;
// 实例化服务器:
const wss = new WebSocketServer({
    port: 3000
});

var globalItem = {
    myName: '',
    mess: {
        type: 0,//判断连接交互类型，0为上传用户信息，1位私聊，2位多播
        user: [],//用户信息
        host: false//判断客户与服务器的关系，如true即client=ws则表示客户端进行初始化
    },
}
var clients = [];//连接池

wss.on('connection', function (ws, req) {
console.log(req)
    var _this = this;
    const ip = req.connection.remoteAddress;//获取客户端ip
    const port = req.connection.remotePort;//获取客户端端口号
    const clientName = ip + port;

    // 将该连接加入连接池
    clients.push(ws);

    //收到信息
    ws.on('message', function (message) {
        // console.log(`[SERVER] Received: ${message}`);//终端打印收到的信息
        var mess = JSON.parse(message);
        //接收信息并根据type执行相应操作
        if (mess.type == 0) {//更新当前在线用户信息;广播
            if (!globalItem.mess.user.some(function (item, index) {
                if (item.ip == mess.user.ip) {
                    globalItem.mess.user[index].name = mess.user.name
                    return true
                }
                else{return false}
            }))
                globalItem.mess.user.push(mess.user);
            globalItem.mess.type = 0;
            //服务器广播，更新在线用户
            clients.forEach(function each(client) {
                // console.log(client)
                if (client == ws && client.readyState === WebSocket.OPEN) {
                    globalItem.mess.host = true;
                    // console.log(`主机${mess.user.ip}初始化`)
                    client.send(JSON.stringify(globalItem.mess));
                }
                else if (client !== ws && client.readyState === WebSocket.OPEN) {
                    globalItem.mess.host = false;
                    // console.log(`主机${mess.user.ip}初始化`)
                    client.send(JSON.stringify(globalItem.mess));
                }
            });

        }
        if(mess.type == 1) {//单播
        }
        if(mess.type == 2) {//组播
        }
        // ws.send(`ECHO: ${message}`, (err) => {
        //     if (err) {
        //         console.log(`[SERVER] error: ${err}`);//终端打印错误信息
        //     }
        // });
    })
});

//服务器错误
wss.on("error", function (err) {
    console.log(err)
})
