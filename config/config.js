module.exports = {
    "systemType": "standard",
    "systemID": "10001",
    "areaCode": "650000",
    "areaName": "新疆",
    "useHttps": true,
    "theme":{
        loginUrl: '/user/login.html',
        homeUrl: '/home.html'
    },
    "gis_init_params": {
        "default_coordinate": [12.500, 104.500],
        "default_z": 8
    },
    'gis-server': 'gis-server.jz',
    'app-common': '192.168.0.3:8080',
    'app-analysis': '192.168.0.38080',
    'app-casespy': 'app-casespy.jz:8080',
    'cache-db': 'cache-db.jz:8080',
    'dc-analysis': '192.168.0.3:8080',
    'app-command': 'app-command.jz:8080'
}
