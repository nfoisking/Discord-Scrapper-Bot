import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { info } from "../../utils/info";
import { _client } from "../../types/client";
import { PrismaClient } from "@prisma/client";
import { emojis } from "../../utils/emojis";

const prisma = new PrismaClient()
export default {
    name: 'redeem',
    description: `Redeem a ${info.name} key`,
    options: [
        {
            name: 'key',
            description: 'The license key from your plan',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async(client: _client, interaction: CommandInteraction) => {[]
        const { options } = interaction;
        // @ts-ignore
        const license_key = options.getString("key");
        const key_db = await prisma.keys.findFirst({
            where: {
                id: license_key
            }
          });
    
          if(!key_db || key_db?.used) return interaction.reply({
            ephemeral: true,
            content: `The key you provided is invalid or **used**, try again.`,
          });
    
          await prisma.keys.delete({
            where: {
                id: license_key
            }
          });
    
          await prisma.users.create({
            data: {
                id: interaction?.user?.id,
                plan: key_db?.type,
                plan_exp: Math.round((Date.now() + key_db?.exp!) / 1000)
            }
        });
        
        await interaction.reply({
            content: `You successfully redeemed a **${key_db?.type}** ${info.name} key.`
        });
      },
}