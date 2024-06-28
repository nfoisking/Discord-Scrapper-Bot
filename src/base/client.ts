import { CustomItents, CustomPartials } from "@magicyan/discord";
import { Client, Collection } from "discord.js";
import { _client } from "../types/client";
import { regcomandos } from "../controller/comandos";
import { regeventos } from "../controller/eventos";
import { config } from "dotenv";

config()
const client = new Client({
    intents: CustomItents.All,
    partials: CustomPartials.All
}) as _client

client.commands = new Collection();
regcomandos(client)
regeventos(client)

client.login(process.env.TOKEN)

export default client;

process.on("unhandledRejection", (reason, promise) => {
    console.log(reason, promise);
  });
  process.on("uncaughtException", (error, origin) => {
    console.log(error, origin);
  });
  process.on("uncaughtExceptionMonitor", (error, origin) => {
    console.log(error, origin);
  });