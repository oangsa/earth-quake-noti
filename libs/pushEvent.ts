import { IEvent } from "@/interfaces/interfaces";
import client from "@/libs/prismadb";

interface IResponse {
    message: string;
    success?: boolean;
}

export default async function pushEvent(event: IEvent): Promise<IResponse> {

    const check = await client.event.findUnique({
        where: {
            event_id: event.event_id
        }
    });

    if (check) {
        return { message: "Event already exists", success: false };
    }

    const response = await client.event.create({
        data: {
            event_id: event.event_id,
            place: event.place,
            time: event.time,
            magnitude: event.magnitude
        }
    });

    if (response) {
        return { message: "OK", success: true };
    }

    return { message: "Failed", success: false };

}
