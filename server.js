//全局属性
var globalItem = {
    myName: '',
    myIp: '',
    type: 99,//标志着第一次初始化时给自己发个ip
    // mess: {
    //     type: 0,//判断连接交互类型，0为上传用户信息(udp广播)，1位私聊，2位多播
    //     user: [],//用户信息
    //     host: false//判断客户与服务器的关系，如true即client=ws则表示客户端进行初始化
    // },
}
//利用UDP模块实现局域网内广播
const dgram = require('dgram');
//服务器端口
const serverPort = '8080'
const serverIP = require('./lib/getIp').getIPAdress()

//客户端端口
const clientPort = '8081'
const clientIp = require('./lib/getIp').getIPAdress()

//组播地址,实现UDP组播
const multicastAddr = '224.100.100.100';

//服务器端；用于与其他对等方建立联系
const server = dgram.createSocket('udp4');

//客户端
const client = dgram.createSocket('udp4');

//用websocket来实现网页界面与服务器信息传输
// 导入WebSocket模块:
const WebSocket = require('ws');
// 引用Server类:
const WebSocketServer = WebSocket.Server;
// 实例化websocket服务器:与界面进行信息传输
const wss = new WebSocketServer({
    port: 3000
});

console.log("当前服务器内网地址：" + serverIP)

// var wsClients = [];//连接池

wss.on('connection', function (ws, req) {



    var _this = this;
    // const ip = req.connection.remoteAddress;//获取客户端ip(来自浏览器的客户端)
    // const port = req.connection.remotePort;//获取客户端端口号(来自浏览器的客户端)
    // const clientName = ip + port;
    // console.log(clientName)

    // // 将该连接加入连接池
    // wsClients.push(ws);

    //监听浏览器（客户端）发来的信息
    ws.on('message', function (message) {
        // console.log(`[SERVER] Received: ${message}`);//终端打印收到的信息
        var mess = JSON.parse(message);
        //接收信息并根据type执行相应操作
        if (mess.type == 0) {//更新当前在线用户信息;udp组播/广播
            // 建立UDP连接，监听8080端口
            server.bind(serverPort);//不用指定主机号
            // //判断该主机是否已建立过连接
            // if (!globalItem.mess.user.some(function (item, index) {
            //     if (item.ip == mess.user.ip) {
            //         globalItem.mess.user[index].name = mess.user.name
            //         return true
            //     }
            //     else{return false}
            // }))
            //     globalItem.mess.user.push(mess.user);

            globalItem.myIp = serverIP + ':' + serverPort
            globalItem.myName = mess.user.name
            mess.user.ip = globalItem.myIp

            ws.send(JSON.stringify(globalItem))
            //广播到局域网下的所有主机的8080端口，测试时用8085
            server.send(JSON.stringify(mess), 8085, multicastAddr);
            // server.send('大家好啊，我是服务端.', 8085, multicastAddr);
            // //服务器广播，更新在线用户;该广播仅是广播到本地3000端口连接websocket的主机，而不是目标的局域网中的主机，废弃
            // wsClients.forEach(function each(wsClient) {
            //     if (wsClient == ws && wsClient.readyState === WebSocket.OPEN) {
            //         globalItem.mess.host = true;
            //         // console.log(`主机${mess.user.ip}初始化`)
            //         wsClient.send(JSON.stringify(globalItem.mess));
            //     }
            //     else if (wsClient !== ws && wsClient.readyState === WebSocket.OPEN) {
            //         globalItem.mess.host = false;
            //         // console.log(`主机${mess.user.ip}初始化`)
            //         wsClient.send(JSON.stringify(globalItem.mess));
            //     }
            // });

        }
        if (mess.type == 1) {//单播
        }
        if (mess.type == 2) {//组播
        }
        if (mess.type == 100) {
            wss.close()
            server.close()
        }
        // ws.send(`ECHO: ${message}`, (err) => {
        //     if (err) {
        //         console.log(`[SERVER] error: ${err}`);//终端打印错误信息
        //     }
        // });
    })

    server.on('close', () => {
        console.log('socket已关闭');
    });

    server.on('error', (err) => {
        console.log(err);
    });

    server.on('listening', () => {
        console.log(`socket正在监听 ${server.address().address}:${server.address().port}`);
        server.addMembership(multicastAddr);
        server.setBroadcast(true);//开启广播
        server.setTTL(128);//设置最大跳数

    });

    server.on('message', (msg, rinfo) => {//监听udp连接下收到的信息
        console.log(`receive message from ${rinfo.address}:${rinfo.port}`);
        var mess = JSON.parse(msg)
        if (mess.type == 0 && mess.user.ip != globalItem.myIp) {//收到别人的广播,客户端要在原有的好友列表中添加好友，同时服务器要发送一个单播响应
            ws.send(JSON.stringify(mess));
            var reMess = {
                type: 4,
                user: {
                    ip: globalItem.myIp,
                    name: globalItem.myName
                }
            }
            var dot = mess.user.ip.indexOf(":")
            var ip = mess.user.ip.slice(0, dot)
            var port = mess.user.ip.slice(dot + 1)
            server.send(JSON.stringify(reMess), port, ip)//在线用户通过udp单播响应多播
        }
        else if (mess.type == 4) {//收到登录广播后别人发来的的单播响应，客户端要显示用户列表，即在好友列表中添加用户
            mess.type = 0;
            ws.send(JSON.stringify(mess));
        }
    });

});

//服务器错误
wss.on("error", function (err) {
    console.log(err)
})