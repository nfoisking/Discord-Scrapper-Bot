import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, CommandInteraction, Component, ComponentType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { _client } from "../../types/client";
import { info } from "../../utils/info";
import { PrismaClient } from "@prisma/client";
import { emojis } from "../../utils/emojis";

const prisma = new PrismaClient()
export default {
    name: 'panel',
    description: `View your profile infos about your ${info.name} use`,

    run: async(client: _client, interaction: CommandInteraction) => {
        
        const user = await prisma.users.findFirst({
            where: {
                id: interaction?.user?.id
            }
        })

        if (!user)
            return interaction.reply({
            ephemeral: true,
            content: `No info found in database, please try again later`
            })

        if (!user.plan)
            return interaction.reply({
                ephemeral: true,
                content: `You don't have a ${info.name} plan, buy it on our tickets.`
            })

            const embed_panel = new EmbedBuilder({
                author: {
                    name: `Lxnny Panel 👀`,
                    icon_url: info.footer.icon as string
                },
                footer: {
                    text: info.footer.text,
                    icon_url: info.footer.icon 
                },
                thumbnail: {
                    url: interaction.user.avatarURL({ size: 4096 }) as string
                },
                description: `The **new** and **innovative** Discord Badges Scrapper`,
                timestamp: new Date(),
                fields: [
                    {
                        name: 'Token:',
                        value: `\`\`\`${user.token || `Not saved yet`}\`\`\``,
                        inline: false
                    },
                    {
                        name: `Plan:`,
                        value: `${user.plan || 'None'}`,
                        inline: true
                    },
                    {
                        name: `Expiration:`,
                        value: `<t:${user.plan_exp!}:R> **(<t:${user.plan_exp!}:D>)**`,
                          inline: true,
                    },
                    {
                        name: 'Logs Channel:',
                        value: `${
                            client.guilds.cache
                              .get(user.guild_id!)
                              ?.channels.cache.get(user.channel_id!)
                              ? client.guilds.cache
                                  .get(user.guild_id!)
                                  ?.channels.cache.get(user.channel_id!)?.url
                              : "Unknown."
                          }`,
                          inline: false
                    }
                ],
                color: info.color 
            })

            const row =  new ActionRowBuilder
            <ChannelSelectMenuBuilder>()
            .addComponents(
                new ChannelSelectMenuBuilder({
                    channel_types: [ChannelType.GuildText],
                    custom_id: 'LogsChannelConfig',
                    placeholder: `Select your logs channel clicking here.`
                })
            )
            const button = new ButtonBuilder({
                custom_id: 'SaveToken',
                label: 'Update your token',
                style: ButtonStyle.Secondary,
            })
            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
            const message = await interaction.reply({
              ephemeral: true,
                embeds: [embed_panel],
                components: [row, buttonRow]
            })
            message.createMessageComponentCollector({
                componentType: ComponentType.ChannelSelect,
                filter: (m) => m.member?.user.id === interaction.user.id,
            })
            .on('collect', async(i) => {
                const channel = await interaction.guild?.channels.fetch(i.values[0]);
                if (!channel)
                     return;

                embed_panel.setFields(
                    {
                        name: 'Token:',
                        value: `\`\`\`${user.token || `Not saved yet`}\`\`\``,
                        inline: false
                    },
                    {
                        name: `Plan:`,
                        value: `${user.plan || 'None'}`,
                        inline: true
                    },
                    {
                       name: `Expiration:`,
                       value: `<t:${user.plan_exp!}:R> **(<t:${user.plan_exp!}:D>)**`,
                       inline: true,
                    },
                    {
                        name: 'Logs Channel:',
                        value: `${channel ? channel?.url : "Unknown."}`,
                        inline: false
                    }
                )

                interaction.editReply({
                    embeds: [embed_panel]
                })
                
            i.reply({
                content: `Now all your scrapper logs will be sent on ${channel}.`,
                ephemeral: true,
              });
              const update = await prisma.users.update({
                where: {
                  id: interaction?.user?.id,
                },
                data: {
                  guild_id: interaction.guild?.id,
                  channel_id: channel?.id,
                },
              });
            });
            message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: (m) => m.member?.user.id === interaction.user.id,
            })
            .on('collect', async(i) => {
                const modal = new ModalBuilder()
                  .setCustomId('token-modal')
                  .setTitle(`${info.name}・Save your Scrap Token`)
              
                const TokenInput = new TextInputBuilder()
                  .setCustomId('tokeninput')
                  .setLabel('Token')
                  .setPlaceholder('Put your token here')
                  .setStyle(TextInputStyle.Short)
                  .setMinLength(10)
              
                const TokenModal = new ActionRowBuilder<TextInputBuilder>().addComponents(TokenInput)
              
                modal.addComponents(TokenModal)
              
                i.showModal(modal)
              
                const modalSubmission = await i.awaitModalSubmit({
                  time: 60000, 
                  filter: (m) => m.customId === 'token-modal'
                })
              
                const token = modalSubmission.fields.getTextInputValue('tokeninput');
                await modalSubmission.deferReply({ ephemeral: true })
                const request = await fetch('https://discord.com/api/v10/users/@me', {
                  headers: {
                    Authorization: token,
                    'Content-Type': 'application/json'
                  }
                }).then(r => r.json() as any)
              
                if (!request.id) {
                  modalSubmission.editReply({
                  content: `You need to pass an **valid** token`
                })
                return;
                } else {
                const update =  await prisma.users.update({
                    where: {
                      id: i.user.id
                    },
                    data: {
                      token: token
                    }
                  })
                  console.log(update)
                
                  modalSubmission.editReply({ 
                    content: 'You saved your token'
                  })
                  i.editReply({
                    embeds: [embed_panel.setFields(
                      {
                        name: 'Token:',
                        value: `\`\`\`${token || `Not saved yet`}\`\`\``,
                        inline: false
                    },
                    {
                        name: `Plan:`,
                        value: `${user.plan || 'None'}`,
                        inline: true
                    },
                    {
                      name: `Expiration:`,
                      value: `<t:${user.plan_exp!}:R> **(<t:${user.plan_exp!}:D>)**`,
                        inline: true,
                    },
                    {
                        name: 'Logs Channel:',
                        value: `${client.channels.cache.get(user.channel_id as string)?.url}`,
                        inline: false
                    }
                    )]
                  })
                }
              })
    }
}