//全局属性
var globalItem = {
    myName: '',
    myIp: '',
    type: 99,//标志着第一次初始化时给自己发个ip
    tcpList: []//连接的TCP服务器客户列表
    // mess: {
    //     type: 0,//判断连接交互类型，0为上传用户信息(udp广播)，1位私聊，2位多播
    //     user: [],//用户信息
    //     host: false//判断客户与服务器的关系，如true即client=ws则表示客户端进行初始化
    // },
}

//服务器地址
const serverIp = require('./lib/getIp').getIPAdress()

//利用UDP模块实现局域网内广播
const dgram = require('dgram');

//udp服务器监听端口号
const udpServerPort = '8081'

//组播地址,实现UDP组播
const multicastAddr = '224.100.100.100';

//udp服务器端；用于与其他对等方建立用户联系
const udpServer = dgram.createSocket('udp4');

//用websocket来实现网页界面与服务器信息传输
// 导入WebSocket模块:
const WebSocket = require('ws');
// 引用Server类:
const WebSocketServer = WebSocket.Server;
// 实例化websocket服务器:与界面进行信息传输
const wss = new WebSocketServer({
    port: 3000
});

console.log("当前服务器内网地址：" + serverIp)

//利用TCP模块实现点对点TCP连接
const net = require('net')

var sockets = [];//连接池

//TCP监听端口号
const tcpServerPort = 6969

//TCP服务器端，用于与其他对等方聊天通讯时建立连接，当收到浏览器那边通过websocket传来的连接信息时调用,（类似于Websocket）
const tcpServer = net.createServer();

// var wsClients = [];//Websocket连接池，因为这里只有一个连接，所以用不到

//Websocket监听与浏览器（客户端）连接
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

            // 建立UDP连接，监听8081端口
            udpServer.bind(udpServerPort);//不用指定主机号

            // //判断该主机是否已建立过连接
            // if (!globalItem.mess.user.some(function (item, index) {
            //     if (item.ip == mess.user.ip) {
            //         globalItem.mess.user[index].name = mess.user.name
            //         return true
            //     }
            //     else{return false}
            // }))
            //     globalItem.mess.user.push(mess.user);

            globalItem.myIp = serverIp + ':' + udpServerPort
            globalItem.myName = mess.user.name
            mess.user.ip = globalItem.myIp

            ws.send(JSON.stringify(globalItem))
            //广播到局域网下的所有主机的8081端口，测试时用8085
            udpServer.send(JSON.stringify(mess), 8085, multicastAddr);
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
        if (mess.type == 1) {//TCP主动建立连接（客户端触发发送消息）
            // process.stdin.resume();	//process.stdin流来接受用户的键盘输入，这个可读流初始化时处于暂停状态，调用流上的resume()方
            // process.stdin.setEncoding('utf8');//设置编码
            console.log("1",globalItem.tcpList)
            if (!globalItem.tcpList.some((item) => { return item.receiver.ip.split(":")[0] == mess.receiver.ip.split(":")[0] })) {//没有在tcp服务器连接的客户列表中

                //双攻流实例化:创建TCP套接字或流式 IPC 端点的抽象
                var netSocket = new net.Socket()
                //请求连接
                // netSocket.connect(6969, (mess.receiver.ip).split(":")[0], () => {
                netSocket.connect(6979, (mess.receiver.ip).split(":")[0], () => {
                    netSocket.name = mess.receiver.name
                    netSocket.ip = mess.receiver.ip.split(":")[0];//对等方的IP
                    globalItem.tcpList.push({ receiver: { name: netSocket.name, ip: netSocket.ip }, tcp: netSocket });
                })

                netSocket.on("error", function (err) {
                    console.log('TCP-Server-socket error:', err.message);
                });
            }
        }
        if (mess.type == 2) {//TCP发送消息（客户端点击发送）
            console.log("2:",globalItem.tcpList)
            globalItem.tcpList.forEach((item) => {
                console.log(item.receiver)
                if (item.receiver.ip.split(":")[0] == mess.receiver.ip.split(":")[0]) {
                    item.tcp.write(JSON.stringify(mess)); //发送消息
                    console.log("发送信息内容为：", mess.mes.value, mess.receiver.ip.split(":")[0])
                    return;
                }
            })
        }
        if (mess.type == 100) {//客户端退出窗口，服务器停止服务
            console.log("退出窗口")
            wss.close()
            udpServer.close()
            tcpServer.close()
        }
        // ws.send(`ECHO: ${message}`, (err) => {
        //     if (err) {
        //         console.log(`[SERVER] error: ${err}`);//终端打印错误信息
        //     }
        // });
    })

    udpServer.on('close', () => {
        console.log('socket已关闭');
    });

    udpServer.on('error', (err) => {
        console.log(err);
    });

    udpServer.on('listening', () => {
        console.log(`socket正在监听 ${udpServer.address().address}:${udpServer.address().port}`);
        udpServer.addMembership(multicastAddr);
        udpServer.setBroadcast(true);//开启广播
        udpServer.setTTL(128);//设置最大跳数
    });

    udpServer.on('message', (msg, rinfo) => {//监听udp连接下收到的信息
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
            // var dot = mess.user.ip.indexOf(":")
            // var ip = mess.user.ip.slice(0, dot)
            // var port = mess.user.ip.slice(dot + 1)
            var dot = mess.user.ip.split(":")
            udpServer.send(JSON.stringify(reMess), dot[1], dot[0])//在线用户通过udp单播响应多播
        }
        else if (mess.type == 4) {//收到登录广播后别人发来的的单播响应，客户端要显示用户列表，即在好友列表中添加用户
            mess.type = 0;
            ws.send(JSON.stringify(mess));
        }
    });

    //TCP服务端收到连接请求
    tcpServer.on("connection", function (socket) {
        console.log(`客户机 ${socket.remoteAddress}:${socket.remotePort} 接入`)

        if (!sockets.some((item) => { return item == socket })) {//未建立过TCP连接
            sockets.push(socket)
            if (!globalItem.tcpList.some((item) => { return item.receiver.ip.split(":")[0] == socket.remoteAddress })) {//没有在tcp服务器连接的客户列表中

                //双攻流实例化:创建TCP套接字或流式 IPC 端点的抽象
                var netSocket = new net.Socket()
                //启动连接
                // netSocket.connect(6969, socket.remoteAddress.split(":")[0], () => {
                //     netSocket.ip = socket.remoteAddress;
                // })
                netSocket.connect(6979, socket.remoteAddress.split(":")[0], () => {
                    // console.log(socket.remoteAddress)
                    // console.log(socket.remoteAddress.split(":")[0])
                    netSocket.ip = socket.remoteAddress.split(":")[0];//存储接入的IP
                    globalItem.tcpList.push({ receiver: { name: "", ip: socket.remoteAddress.split(":")[0] }, tcp: netSocket });
                    console.log("3:",globalItem.tcpList,netSocket.ip)

                })

                netSocket.on("error", function (err) {
                    console.log('TCP-Server-socket error:', err.message);
                });


            }

        }
        //接收到数据
        socket.on("data", function (message) {
            console.log("socketLink-getdata")
            //服务器获取TCP另一端发送来的数据并通过websocket传给客户端
            ws.send(JSON.stringify(JSON.parse(message)))
        })

        //断开连接，删除被关闭的连接
        socket.on("close", function () {
            console.log(`${socket.remoteAddress}:${socket.remotePort}断开连接`)
            var idx = sockets.indexOf(socket);
            sockets.splice(idx, 1);
            globalItem.tcpList.forEach(function (item, index) {
                if (item.receiver.ip == socket.remoteAddress) idx = index
            })
            globalItem.tcpList.splice(idx, 1)
        })
        socket.on("error", function (err) {
            console.log('TCP-Server-link error:', err.message);
        });

    })
    // 开始监听时调用
    tcpServer.on("listening", function () {
    });

    tcpServer.on("error", function (err) {
        console.log('TCP-Server error:', err.message);
    });
    //TCP服务关闭
    tcpServer.on('close', function () {
        console.log('TCP-Server closed');
    });
    tcpServer.listen({
        port: tcpServerPort,
        host: serverIp,
        exclusive: true,//ban port sharing 
    });

});

//服务器错误
wss.on("error", function (err) {
    console.log(err)
})




