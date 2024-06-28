import { Client, Collection } from "discord.js";

export interface _client extends Client {
    commands: Collection<string, any>;
}