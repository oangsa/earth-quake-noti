import { IData, IEvent } from '@/interfaces/interfaces';
import pushEvent from '@/libs/pushEvent';
import { NextResponse } from 'next/server';

type CResponse = {
    message: string;
    success?: boolean;
}


async function sendToDiscord(data: IData): Promise<void> {
    const response = await fetch(process.env.WEBHOOK_URL as string, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    console.log("🚀 Discord response:", response.status);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateTimeDifference(time: string): number {
    const currentTime = new Date();
    const earthquakeTime = new Date(time);
    const difference = Math.abs(currentTime.getTime() - earthquakeTime.getTime());

    return difference / 1000; // seconds
}

export async function GET(): Promise<NextResponse<CResponse>> {
    const BASEURL = process.env.BASEURL as string;
    const FORMAT = process.env.FORMAT as string;
    const MINMAG = process.env.MINMAG as string;
    const KMUTT_LAT = parseFloat(process.env.KMUTT_LAT as string);
    const KMUTT_LON = parseFloat(process.env.KMUTT_LON as string);
    const TIME_DIFFERENCE_S = parseInt(process.env.TIME_DIFFERENCE_S as string); // seconds

    // YYYY-MM-DD
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const today = `${year}-${month}-${day}`;
    const nextDay = `${year}-${month}-${day + 1}`;

    const URL = `${BASEURL}format=${FORMAT}&starttime=${today}&endtime=${nextDay}&minmagnitude=${MINMAG}&orderby=time`;

    const response = await fetch(URL);
    const rawData = await response.json();

    const earthquakes = rawData.features;

    const firstEarthquake = earthquakes[0];

    const properties = firstEarthquake.properties;
    const geometry = firstEarthquake.geometry;

    const lat = geometry.coordinates[1];
    const lon = geometry.coordinates[0];

    const distance = calculateDistance(KMUTT_LAT, KMUTT_LON, lat, lon);

    console.log("URL:", URL);

    const event: IEvent = {
        id: "",
        event_id: properties.ids,
        place: properties.place,
        time: new Date(properties.time),
        magnitude: properties.mag
    }


    if (distance <= 2000 && (calculateTimeDifference(properties.time) <= TIME_DIFFERENCE_S || calculateTimeDifference(properties.updated) <= TIME_DIFFERENCE_S)) {

        const response = await pushEvent(event);

        if (!response.success) return NextResponse.json({ message: "Event already exists" }, { status: 400 });

        const data: IData = {
            username: "Earthquake Notifier",
            content: "||@everyone||",
            avatar_url: "https://emojicombos.com/wp-content/uploads/2020/04/earthquake-emoji-1.png",
            embeds: [
                {
                    title: `🚨 Earthquake Alert`,
                    url: properties.url,
                    description: `Earthquake detected!`,
                    color: 16711680,
                    fields: [
                        {
                            name: "🌍 Location",
                            value: properties.place,
                            inline: false
                        },
                        {
                            name: "📏 Distance",
                            value: `${distance.toFixed(2)} km`,
                            inline: true
                        },
                        {
                            name: "📏 Depth",
                            value: `${properties.depth} km`,
                            inline: true
                        },
                        {
                            name: "📏 Magnitude",
                            value: `${properties.mag} ${properties.magType}`,
                            inline: true
                        },
                        {
                            name: "🕒 Time",
                            value: `${new Date(properties.time).toLocaleString()}`,
                            inline: false
                        },
                    ],
                    footer: {
                        text: "Earthquake Notifier Made by @oangsa"
                    }
                }
            ]
        }

        await sendToDiscord(data);
    }

    // for (const earthquake of earthquakes) {
    //     const properties = earthquake.properties;
    //     const geometry = earthquake.geometry;

    //     const lat = geometry.coordinates[1];
    //     const lon = geometry.coordinates[0];

    //     const distance = calculateDistance(KMUTT_LAT, KMUTT_LON, lat, lon);

    //     if (distance <= 2000 && (calculateTimeDifference(properties.time) <= TIME_DIFFERENCE_S || calculateTimeDifference(properties.updated) <= TIME_DIFFERENCE_S)) {
    //         const data: IData = {
    //             username: "Earthquake Notifier",
    //             content: "||@everyone||",
    //             avatar_url: "https://emojicombos.com/wp-content/uploads/2020/04/earthquake-emoji-1.png",
    //             embeds: [
    //                 {
    //                     title: `🚨 Earthquake Alert`,
    //                     url: properties.url,
    //                     description: `Earthquake detected!`,
    //                     color: 16711680,
    //                     fields: [
    //                         {
    //                             name: "🌍 Location",
    //                             value: properties.place,
    //                             inline: false
    //                         },
    //                         {
    //                             name: "📏 Distance",
    //                             value: `${distance.toFixed(2)} km`,
    //                             inline: true
    //                         },
    //                         {
    //                             name: "📏 Depth",
    //                             value: `${properties.depth} km`,
    //                             inline: true
    //                         },
    //                         {
    //                             name: "📏 Magnitude",
    //                             value: `${properties.mag} ${properties.magType}`,
    //                             inline: true
    //                         },
    //                         {
    //                             name: "🕒 Time",
    //                             value: `${new Date(properties.time).toLocaleString()}`,
    //                             inline: false
    //                         },
    //                     ],
    //                     footer: {
    //                         text: "Earthquake Notifier Made by @oangsa"
    //                     }
    //                 }
    //             ]
    //         }

    //         await sendToDiscord(data);
    //     }
    // }

    return NextResponse.json({ message: "OK" }, { status: 200 })
}
