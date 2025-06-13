import { Queue } from '@forge/events';

const analyticsQueue = new Queue({ key: 'analytics-queue' });

export const track = async (context, eventName) => {
    // Do the group and identify call here too
    const identifyTraits = {name: context.accountId};
    const groupTraits = {name: context.cloudId};

    const events = [
        {type: "identify", userId: context.accountId, groupId: context.cloudId, traits: identifyTraits},
        {type: "group", groupId: context.cloudId, traits: groupTraits},
        {type: "track", userId: context.accountId, event: eventName},
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