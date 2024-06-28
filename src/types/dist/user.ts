export interface User {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
    banner: string | null;
    bio: string | null;
};

export interface UserProfile {
    pronouns: string | null;
    theme_colors: number[];
};

export interface Badges {
    id: string;
    description: string;
    icon: string;
    link: string
};
export interface MutualGuilds {
    id: string;
    nick: string | null;
};

export interface ConnectedAccounts {
    type: string | null;
    id: string | null;
    name: string | null;
    verified: boolean;
};

export type DiscordUser = {
    user: User;
    connected_accounts: ConnectedAccounts[];
    premium_since?: Date;
    premium_type?: Number;
    premium_guild_since?: Date;
    user_profile: UserProfile;
    badges: Badges[];
    mutual_guilds: MutualGuilds[];
    legacy_username: string | null
};