import {
    Events,
    ApplicationCommandOptionType,
    ChannelType,
    Interaction,
  } from "discord.js";
  import client from "../../base/client";

  export default {
    name: Events.InteractionCreate,
    once: false,
  
    async execute(interaction: Interaction) {
      if (
        interaction.channel?.type === ChannelType.DM ||
        !interaction.isCommand()
      )
        return;
      const command = client.commands.get(interaction.commandName);
      const args = [];
  
      for (const commandOptions of interaction?.options?.data) {
        if (commandOptions.type === ApplicationCommandOptionType.Subcommand) {
          if (commandOptions.name) args.push(commandOptions.name);
          commandOptions.options?.forEach((x) => {
            if (x.value) args.push(x.value);
          });
        } else if (commandOptions.value) {
          args.push(commandOptions.value);
        }
      }
  
      command.run(client, interaction, args);
    },
  };
  