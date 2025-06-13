import { Queue } from '@forge/events';
import {groupIdFromContext, userIdFromContext} from "./utils";

const analyticsQueue = new Queue({ key: 'analytics-queue' });

export const track = async (context, eventName) => {
    // Do the group and identify call here too
    const userId = userIdFromContext(context);
    const groupId = groupIdFromContext(context);
    const identifyTraits = {name: userId};
    const groupTraits = {name: groupId};

    const events = [
        {type: "identify", userId: userId, groupId: groupId, traits: identifyTraits},
        {type: "group", groupId: groupId, traits: groupTraits},
        {type: "track", userId: userId, event: eventName},
    ];
    await analyticsQueue.push(events);
}

export const trackCreate = async (context) => {
    await track(context, "Backend: Create");
}

export const trackUpdate = async (context) => {
    await track(context, "Backend: Update");
}

export const trackDelete = async (context) => {
    await track(context, "Backend: Delete");
}

export const trackDeleteAll = async (context) => {
    await track(context, "Backend: Delete All");
}