//获取本机ip地址
module.exports = {
    //获取服务器端的ip地址
    getIPAdress: function () {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    },
    //获取客服端ip地址
    getClientIp: function (req) {
        var ip = req.headers['x-forwarded-for'] ||
            req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '';
        if (ip.split(',').length > 0) {
            ip = ip.split(',')[0]
        }
        ip = ip.substr(ip.lastIndexOf(':') + 1, ip.length);
        console.log("ip:" + ip);
        return ip;
    }

}

