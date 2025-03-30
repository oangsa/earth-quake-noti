export interface IData {
    embeds: IEmbed[];
    username?: string;
    content?: string;
    avatar_url?: string;
}

export interface IEmbed {
    title: string;
    url?: string;
    description?: string;
    color?: number;
    fields?: IField[];
    footer?: IFooter;
}

export interface IField {
    name: string;
    value: string;
    inline?: boolean;
}

export interface IFooter {
    text: string;
}

export interface IEvent {
    id: string;
    event_id: string;
    place: string;
    time: Date;
    magnitude: number;
}
