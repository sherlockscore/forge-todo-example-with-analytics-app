import { Queue } from '@forge/events';

const analyticsQueue = new Queue({ key: 'analytics-queue' });

const track = async (userId, eventName) => {
    await analyticsQueue.push({userId: userId, event: eventName});
}

export const trackGetAll = async (userId) => {
    await track(userId, "Backend: Get All");
}

export const trackCreate = async (userId) => {
    await track(userId, "Backend: Create");
}

export const trackUpdate = async (userId) => {
    await track(userId, "Backend: Update");
}

export const trackDelete = async (userId) => {
    await track(userId, "Backend: Delete");
}

export const trackDeleteAll = async (userId) => {
    await track(userId, "Backend: Delete All");
}