import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, GuildMemberManager, StringSelectMenuBuilder, TextChannel } from "discord.js";
import { _client } from "../../types/client";
import { info, proxy } from "../../utils/info";
import { PrismaClient } from "@prisma/client";
import { Client } from "discord.js-selfbot-v13";
import { DiscordUser } from "../../types/dist/user";
import { _badges } from "../../utils/badges";
import { badges_emoji } from "../../utils/ebadges";
import { vbadges } from "../../utils/valid_badges";
import { HttpsProxyAgent } from "https-proxy-agent";
import getBoost, { Boost } from "../../api/functions/getBoost";
import { boosts } from "../../utils/boosts";
import { brBuilder } from "@magicyan/discord";
import axios from "axios";
import { emojis } from "../../utils/emojis";

const prisma = new PrismaClient()

export default {
    name: 'scrapper',
    description: `Use ${info.name}'s badges scrapper`,

    run: async(client: _client, interaction: CommandInteraction) => {
        await interaction.deferReply({ ephemeral: true })
        const user = await prisma.users.findFirst({
            where: {
                id: interaction?.user?.id
            }
        })
        if (!user) return interaction.editReply({ 
            content: `I couldn't find you in the database, are you sure you have a plan?`
        })
        if (!user.plan) return interaction.editReply({
            content: `You don't have a plan, if you want to purchase one, open a ticket`
        })
        if (!user.token) return interaction.editReply({
            content: `You don't have a saved token, buddy. Before proceeding, use /panel and save a logs token and channel.`
        })
        const test_token = await fetch(process.env.API + `/users/@me`, {
            headers: {
                Authorization: user.token,
                'Content-Type': 'application/json'
            }
        }).then(r => r.json() as any)
        if (!test_token.id) return interaction.editReply({
            content: `Your token is no longer valid, to update it, use /panel again and click Update your token`
        })
        // @ts-ignore
     const self_client = new Client({ checkUpdate: false })
       self_client.login(user.token)
        
        self_client.on('ready', async() => {
            console.log(self_client.user?.username)

            const _guilds = self_client.guilds.cache.map(guild => ({
                label: guild.name,
                value: guild.id,
                description: `Active: ${guild.members.cache.filter(member => member.presence?.status !== 'offline').size} | Total: ${guild.memberCount} `,
            }))
            
            const select_menu = new StringSelectMenuBuilder()
            .setCustomId('servers-select')
            .setPlaceholder('Select a server to scrap')
            .addOptions(_guilds.slice(0,25))

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select_menu)
            const logged_embed = new EmbedBuilder({
                timestamp: new Date(),
                color: info.color,
                author: {
                    name: `${info.name} Scrapper`,
                    icon_url: self_client.user?.avatarURL({ size: 4096}) as string
                },
                footer: {
                    text: info.footer.text,
                    icon_url: info.footer.icon as string
                },
                description: `The **new** and **innovative** Discord Badges Scrapper`,
                thumbnail: { url: self_client.user?.avatarURL({ size: 4096 }) as string }, 
                fields: [
                    {
                        name: `User:`,
                        value: `${self_client.user?.globalName || ''} \`[@${self_client.user?.username}]\``,
                        inline: true,
                    },
                    {
                        name: `Servers:`,
                        value: `In \`${self_client.guilds.cache.size}\` servers`,
                        inline: true
                    },
                    {
                        name: `Logs Channel`,
                        value: client.channels.cache.get(user.channel_id as string)?.url as string
                    }
                ]
            })

            await interaction.editReply({ embeds: [logged_embed], components: [row] })

            client.on('interactionCreate', async (inter) => {

                if (!inter.isStringSelectMenu()) return;
            
                if (inter.customId === 'servers-select') {
                    await inter.deferReply({ ephemeral: true });

                    
                    const guildId = inter.values[0];
                    const guild = self_client.guilds.cache.get(guildId as string);
            
                    const user_logs = client.channels.cache.get(user?.channel_id as string) as TextChannel

                    if (!guild) return await inter.editReply({
                      content: `You need to choose a guild before proceeding or the guild you entered is not available`,
                    });
            
                    await inter.editReply({
                      content: `I'm going to scrape ${guild.name} and send to ${client.channels.cache.get(user.channel_id as string)?.url} your logs`,
                    });
                    

                    const badges__: { [ key: string]: string } = badges_emoji
                    const valid_badges: { [ key: string ]: string} = vbadges

                    const members = await guild.members.fetch()
                    const membersIDS = members.map(member => member.user.id) as any

                    for (const id of membersIDS) {
                        const user_id = await self_client.users.
                        fetch(id)
                        try {
                            
                            const req = await axios.get(`https://discord.com/api/v10/users/${user_id.id}/profile`,
                            {
                                method: 'GET',
                                headers: {
                                    Authorization: self_client.token,
                                    'Content-Type': 'application/json'
                                },
                                proxy: proxy
                            }
                        );

                            const request = req.data
        
                                const badgesArray =
                                request.badges.
                                map((b: any) => _badges.find(x => x?.id === b?.id)). 
                                map((n: any) => n?.name)

                                console.log(badgesArray)
                                

                                if (badgesArray) {
                                    const badges_array: string = badgesArray
                                    .filter((badge: string) => valid_badges[badge])
                                    .map((badge: string) => valid_badges[badge])
                                    .join('')

                                    if (badges_array.length > 0) {
                                        const badges: string = badgesArray
                                        .map((badge: string) => badges__[badge])
                                        .join('')

                                        console.log(`Badges found: @${user_id.username} (${badges})`)
                                        const createdAt = user_id.createdAt as any
                                        const userfound_embed = new EmbedBuilder({
                                            author: {
                                                name: `${info.name}・${user_id.globalName || ''} (@${user_id.username})`,
                                                icon_url: info.footer.icon as string
                                            },
                                            footer: {
                                                text: `${guild.name}`,
                                                icon_url: `${guild.iconURL({ size: 4096 })}`,
                                            },
                                            timestamp: new Date(),
                                            color: info.color,
                                            thumbnail: { url: user_id.avatarURL({ size: 4096 }) as string},
                                            description: `The **new** and **innovative** Discord Badges Scrapper`,
                                            fields: [
                                                {
                                                    name: `User:`,
                                                    value: `${user_id.globalName || ''} \`[@${user_id.username}]\``,
                                                    inline: true
                                                },
                                                {
                                                    name: `Badges:`,
                                                    value: badges,
                                                    inline: true
                                                },
                                                {
                                                    name: `Creation Date:`,
                                                    value: `<t:${Math.floor(createdAt / 1000)}:R>`,
                                                    inline: true
                                                }, 
                                                {
                                                    name: `ID:`,
                                                    value: request.user.id,
                                                    inline: true
                                                }
                                            ]
                                        })
    
                                        const button_ = new ButtonBuilder({
                                            label: 'View Boost Informations',
                                            style: ButtonStyle.Secondary,
                                            custom_id: 'VBI',
                                        })

                                        const button__ = new ButtonBuilder({
                                            label: `Open ${user_id.username} DM`,
                                            style: ButtonStyle.Link,
                                            url: `https://discord.com/channels/@me/${user_id.id}`,
                                        })
                                        if (!request.premium_guild_since) {
                                            button_.setDisabled(true)
                                        }
    
                                        const button = new ActionRowBuilder<ButtonBuilder>().addComponents(button_, button__)
    
                                       const msg =  await user_logs.send({
                                            embeds: [userfound_embed],
                                            components: [button]
                                        })
    
                                        msg.createMessageComponentCollector({
                                            componentType: ComponentType.Button,
                                            filter: (m) => m.member?.user.id === interaction.user.id,
                                        }). 
                                        on('collect', async(vbi) => {
                                            if (vbi.customId === 'VBI') {
                                                const boost_level = request.badges.find((x: any) => x?.id.startsWith('guild_booster_'))?.id
                                                const boost_date = request.premium_guild_since as Date
    
                                                const nitro_since = `<t:${~~(Math.round(request?.premium_since?.getTime()) / 1000)}:R> **(<t:${~~(Math.round(request?.premium_since?.getTime()) / 1000)}):D>**`
                                                const boost_info = getBoost(boost_level, new Date(boost_date))
                                                const embed_boost = new EmbedBuilder()
                                                .setColor(info.color)
                                                .setThumbnail(`${user_id.avatarURL({ size: 4096 })}`)
                                                .setTitle(`${request.user.username}'s Boost Informations`)
                                                .setDescription(`The **new** and **innovative** Discord Badges Scrapper`)
        
                                                embed_boost.addFields(
                                                    {
                                                        name: `Nitro Since:`,
                                                        value: nitro_since
                                                    },
                                                    {
                                                        name: `Current Boost:`,
                                                        // @ts-ignore
                                                        value: `${badges_emoji[boost_info?.current_level as keyof typeof badges_emoji]} <t:${~~(Math.round(boost_info?.current_level_date?.getTime()) / 1000)}:R> **(<t:${~~(Math.round(boost_info?.current_level_date?.getTime()) / 1000)}:D>)**`,
                                                    },
                                                    {
                                                        name: `Next Boost:`,
                                                        // @ts-ignore
                                                        value: `${badges_emoji[boost_info?.next_level as keyof typeof badges_emoji]} <t:${~~(Math.round(boost_info?.next_level_date?.getTime()) / 1000)}:R> **(<t:${~~(Math.round(boost_info?.next_level_date?.getTime()) / 1000)}:D>)**`,
                                                    }
                                                );
    
                                                if (boost_info?.current_level === 'BoostLevel9') {
                                                    embed_boost.setFields(
                                                        {
                                                            name: `Current Boost:`,
                                                            // @ts-ignore
                                                            value: `${badges_emoji[boost_info?.current_level as keyof typeof badges_emoji]} <t:${~~(Math.round(boost_info?.current_level_date?.getTime()) / 1000)}:R> **(<t:${~~(Math.round(boost_info?.current_level_date?.getTime()) / 1000)}:D>)**`,
                                                        }
                                                    );
                                                }
        
                                                vbi.reply({
                                                    ephemeral: true,
                                                    embeds: [embed_boost]
                                                })
                                            }
                                        })
                                    
                                  
                                
                                    }
                                }


                        } catch(e) {
                            console.error(e)
                        }
                    }
                }
            });
        })
    }
}