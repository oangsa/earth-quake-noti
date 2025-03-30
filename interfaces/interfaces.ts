interface IEmbed {
    title: string;
    url?: string;
    description?: string;
    color?: number;
    fields?: IField[];
    footer?: IFooter;
    timestamp?: string;
    author?: IAuthor;
}

interface IField {
    name: string;
    value: string;
    inline?: boolean;
}

interface IFooter {
    text: string;
}

interface IAuthor {
    name: string;
    iconURL: string;
}

export interface IUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string;
    accent_color: string | null;
    global_name: string | null;
    avatar_decoration_data: string | null;
    collectibles: string | null;
    banner_color: string | null;
    clan: string | null;
    primary_guild: string | null;
}

export interface IData {
    embeds: IEmbed[];
    username?: string;
    content?: string;
    avatar_url?: string;
}

export interface IEvent {
    id: string;
    event_id: string;
    place: string;
    time: Date;
    magnitude: number;
}
