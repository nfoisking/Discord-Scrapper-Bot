import { ActivityType, ClientPresence, Events } from "discord.js";
import { _client } from "../../types/client";
import { info } from "../../utils/info";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
export default {
    name: Events.ClientReady,
    once: false,

    async execute(client: _client) {
        // @ts-ignore
        await client.application?.commands.set(client.commands);
        client.user?.setStatus(info.bot_status)
        client.user?.setActivity({
            name: `${info.bot_atv.name}`,
            type: ActivityType.Custom
        })
        console.log('SCRAPER・ Bot Online ')
    }
}