import { randomBytes } from 'crypto'
import { info } from '../../utils/info'
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { _client } from '../../types/client'
import { PrismaClient} from '@prisma/client'
import { emojis } from '../../utils/emojis'

const prisma = new PrismaClient()

export default {
    name: 'create_keys',
    description: `Generate ${info.name} keys`,
    options: [
        {
            name: 'type',
            description: 'License type',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Monthly',
                    value: 'monthly'
                },
                {
                    name: 'Lifetime',
                    value: 'lifetime'
                }
            ]
        },
        {
            name: 'quantity',
            description: 'quantity of keys will be created',
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ],
    
    run: async (client: _client, interaction: CommandInteraction) => {

        const { options } = interaction;
        if (interaction.user?.id !==
            process.env.ID
        ) return interaction.reply({ content: `You dont have perms to use that`})

        // @ts-ignore
        const tipo = options.getString('type');
        // @ts-ignore
        const quant = options.getNumber('quantity');

        switch (tipo) {
            case 'monthly':
                const keys_mensais = [];
                for (let i = 1; i <= Number(quant); i++) {
                    keys_mensais.push({
                        id: `${randomBytes(20).toString('hex')}`,
                        used: false,
                        type: 'Monthly',
                        exp: 2.628e+9
                    });
                };
                await prisma.keys.createMany({
                    data: keys_mensais
                });
                await interaction.reply({
                    ephemeral: true,
                    content: `Created **${quant}** Monthly ${info.name} Keys\n\`\`\`${keys_mensais.map((key) => key.id).join('\n')}\`\`\``
                })
                break;
            case 'lifetime':
                const perm_keys = []
                for (let i = 1; i <= Number(quant); i++) {
                    perm_keys.push({
                        id: `${randomBytes(20).toString('hex')}`,
                        used: false,
                        type: 'Lifetime',
                        exp: 6.312e+11
                    })
                }
                await prisma.keys.createMany({
                    data: perm_keys
                })
                await interaction.reply({
                    ephemeral: true,
                    content: `Created **${quant}** Lifetime ${info.name} Keys\n\`\`\`${perm_keys.map((key) => key.id).join('\n')}\`\`\``
                });
                break
        }
    }
}