console.log("[INFO] Starting MyESP WebSocket Emulation Server");

const WebSocket = require("ws");

console.log("[INFO] You can connect to ws://localhost or load URL .../src/websrc/temp/index.html");
console.log("[INFO] Password is 'neo'");

const wss = new WebSocket.Server({
    port: 80
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

var networks = {
    "command": "ssidlist",
    "list": [{
        "ssid": "Company's Network",
        "bssid": "4c:f4:39:a1:41",
        "rssi": "-84"
    },
    {
        "ssid": "Home Router",
        "bssid": "8a:e6:63:a8:15",
        "rssi": "-42"
    },
    {
        "ssid": "SSID Shown Here",
        "bssid": "8a:f5:86:c3:12",
        "rssi": "-77"
    },
    {
        "ssid": "Great Wall of WPA",
        "bssid": "9c:f1:90:c5:15",
        "rssi": "-80"
    },
    {
        "ssid": "Not Internet",
        "bssid": "8c:e4:57:c5:16",
        "rssi": "-87"
    }
    ]
}

var eventlog = {
    "command": "eventlist",
    "page": 1,
    "haspages": 1,
    "list": [
        "{\"type\":\"WARN\",\"src\":\"system\",\"desc\":\"test data\",\"data\":\"Record #1\",\"time\": 1563371160}",
        "{\"type\":\"WARN\",\"src\":\"system\",\"desc\":\"test data\",\"data\":\"Record #2\",\"time\":0}",
        "{\"type\":\"INFO\",\"src\":\"system\",\"desc\":\"System booted Local Time is 13:02:54 CET\",\"data\":\"\",\"time\":1572613374}",
        "{\"type\":\"WARN\",\"src\":\"system\",\"desc\":\"test data\",\"data\":\"Record #3\",\"time\":0}"
    ]
}

var configfile = {
    "command": "configfile",
    "network": {
        "ssid": "myssid",
        "wmode": 0,
        "password": "password",
        "password": "",
        "staticip": "",
        "gatewayip": "",
        "nmask": "",
        "dnsip": ""
    },
    "general": {
        "hostname": "myesp",
        "password": "admin",
        "serial": true,
        "version": "1.9.1",
        "log_events": false,
        "log_ip": "192.168.1.4"
    },
    "mqtt": {
        "enabled": false,
        "ip": "10.10.10.10",
        "port": 1883,
        "qos": 1,
        "keepalive": 60,
        "retain": true,
        "base": "base",
        "user": "user",
        "password": "password",
        "heartbeat": false
    },
    "ntp": {
        "server": "pool.ntp.org",
        "interval": 60,
        "timezone": 2,
        "enabled": true
    }
};

var custom_configfile = {
    "command": "custom_configfile",
    "settings": {
        "ledpin": 2
    }
};

function sendEventLog() {
    wss.broadcast(eventlog);
    var res = {
        "command": "result",
        "resultof": "eventlist",
        "result": true
    };
    wss.broadcast(res);
}

function sendStatus() {
    var stats = {
        "command": "status",
        "availspiffs": 948,
        "spiffssize": 957,
        "initheap": 25392,
        "heap": 13944,
        "sketchsize": 673,
        "availsize": 2469,
        "ip": "10.10.10.198",
        "ssid": "my_ssid",
        "mac": "DC:4F:12:22:13:06",
        "signalstr": 62,
        "systemload": 0,
        "mqttconnected": true,
        "mqttheartbeat": false,
        "uptime": "0 days 0 hours 1 minute 45 seconds",
        "mqttloghdr": "home/myesp/",
        "mqttlog": [
            { "topic": "start", "payload": "start", "time": 1565956388 }
        ]
    };

    wss.broadcast(stats);
}

function sendCustomStatus() {
    var stats = {
        "command": "custom_status",
        "version": "1.0.0",
        "customname": "MyESP",
        "appurl": "https://github.com/proddy/MyESP",
        "updateurl": "https://api.github.com/repos/proddy/MyESP/releases/latest",
        "updateurl_dev": "https://api.github.com/repos/proddy/MyESP/releases/tags/travis-dev-build",

        "test": {
            "ok": true,
            "msg": "Testing..."
        }

    };

    wss.broadcast(stats);
}

wss.on('connection', function connection(ws) {
    ws.on("error", () => console.log("[WARN] WebSocket Error - Assume a client is disconnected."));
    ws.on('message', function incoming(message) {
        var obj = JSON.parse(message);
        console.log("[INFO] Got Command: " + obj.command);
        switch (obj.command) {
            case "configfile":
                console.log("[INFO] New system config received");
                configfile = obj;
                break;
            case "custom_configfile":
                console.log("[INFO] New custom config received");
                custom_configfile = obj;
                break;
            case "status":
                console.log("[INFO] Sending Fake Emulator Status");
                sendStatus();
                break;
            case "custom_status":
                console.log("[INFO] Sending custom status");
                sendCustomStatus();
                break;
            case "scan":
                console.log("[INFO] Sending Fake Wireless Networks");
                wss.broadcast(networks);
                break;
            case "gettime":
                console.log("[INFO] Sending time");
                var res = {};
                res.command = "gettime";
                res.epoch = 1572613374; // this is 13:02:54 CET
                wss.broadcast(res);
                break;
            case "getconf":
                console.log("[INFO] Sending system configuration file (if set any)");
                wss.broadcast(configfile);
                break;
            case "restart":
                console.log("[INFO] Restart");
                break;
            case "destroy":
                console.log("[INFO] Destroy");
                break;
            case "forcentp":
                console.log("[INFO] getting ntp time");
                break;
            default:
                console.log("[WARN] Unknown command");
                break;
        }
    });
});