import { Client } from "discord.js";
import { readdirSync } from 'fs';

export async function regeventos(client: Client) {
    for (const tipo of readdirSync('./src/event')) {
        readdirSync(`./src/event/` + tipo)
        .forEach(async (file) => {
            const { default: event } = await import(
                `../event/${tipo}/${file}`
            );
            if (event.once) {
                client.once(event.name, (...params) => event.execute(...params));
            } else {
                client.on(event.name, (...params) => event.execute(...params));
            }
        })
    }
}