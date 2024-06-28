import { PresenceStatusData } from "discord.js";

export const info = {
    footer: {
        text: 'nfo',
        icon: 'https://cdn.discordapp.com/attachments/1249339978127769672/1250861920278417478/OIG1.png?ex=666c7b71&is=666b29f1&hm=a868c809332fc7d56b88f8d0a003e797790d9e1d4db201d121765814c945d69e&'
    },
    name: 'nfo',
    color: 0x000000,
    bot_status: 'dnb' as PresenceStatusData,  // coloca ou idle (ausente), ou dnd (nao pertube)
    bot_atv: {
        name: 'bot feito pelo nfo :)'  // aqui tu coloca oq tu quer q apareça no status do bot
    }
}

export const proxy = {
    protocol: 'http',
    port: 80,
    host: 'p.webshare.io',
    auth: {
        username: 'vncdawtt-rotate',
        password: 'dbegl9g90bhi'
    }
}

export const ProxyAgentInfo = {
    address: '38.154.227.167',
    port: 5868,
    username: 'qmwhkbxt',
    password: 'kqxa3uw37k8e',
}

export const ProxyAgent = {
    proxy_agent_test: `${ProxyAgentInfo.address}:${ProxyAgentInfo.port}`,
    proxy_agent: `${ProxyAgentInfo.address}:${ProxyAgentInfo.port}:${ProxyAgentInfo.username}:${ProxyAgentInfo.password}`,
}