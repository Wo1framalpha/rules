module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
    const data = yaml.parse(raw)

    // 创建要添加到 proxies 列表中的新元素
    const newProxy = {
        name: "落地中转节点名称", // 落地中转节点名称
        type: "ss", // 落地中转协议
        server: "127.0.0.1", // 不用改
        port: 7892, // 不用改
        cipher: "", // 落地中转加密算法
        password: "" // 落地中转密码
    };

    // 检查并添加新元素到 proxies
    if (data.proxies && Array.isArray(data.proxies)) {
        data.proxies.push(newProxy);
    } else {
        console.error('tunnel_parser.js: proxies not found or is not an array in YAML file.');
    }

    if (data['proxy-groups'] && Array.isArray(data['proxy-groups'])) {
        const manualSwitchGroup = data['proxy-groups'].find(group => group.name === '🚀 手动切换');
        if (manualSwitchGroup && manualSwitchGroup.proxies && Array.isArray(manualSwitchGroup.proxies)) {
            manualSwitchGroup.proxies.push("落地中转节点名称"); // 落地中转节点名称
        } else {
            console.error('tunnel_parser.js: "🚀 手动切换" group not found or proxies not an array.');
        }
    } else {
        console.error('tunnel_parser.js: proxy-groups not found or is not an array in YAML file.');
    }

    // 创建新的 tunnels 数据
    const newTunnels = {
        tunnels: [
            {
                network: ['tcp', 'udp'],
                address: '127.0.0.1:7892',
                target: 'ip:port', // 落地中转ip:port
                proxy: '🇺🇲 美国节点'
            }
        ]
    };

    // 在 proxies 之后添加 tunnels
    if (data.proxies) {
        // 寻找 proxies 在对象中的索引
        const keys = Object.keys(data);
        const proxiesIndex = keys.indexOf('proxies');

        // 在 proxies 之后插入 tunnels
        const updatedData = {};
        for (let i = 0; i < keys.length; i++) {
            updatedData[keys[i]] = data[keys[i]];
            if (i === proxiesIndex) {
                Object.assign(updatedData, newTunnels);
            }
        }

        console.log('tunnel_parser.js: YAML file updated successfully.');
        return yaml.stringify(updatedData);
    } else {
        console.error('tunnel_parser.js: proxies not found in YAML file.');
    }

    return yaml.stringify(data);
}