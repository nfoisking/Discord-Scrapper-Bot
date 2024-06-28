import { _client } from "../types/client";
import { readdirSync } from 'fs';

export async function regcomandos(client: _client) {
    for (const c of readdirSync('./src/command')) {
        readdirSync('./src/command/' + c)
        .forEach(async (file) => {
            const { default: command } = await import(
                `../command/${c}/${file}`
            );
 
            if (command.name) {
                client.commands.set(command.name, command)
            };
        });
    };
};