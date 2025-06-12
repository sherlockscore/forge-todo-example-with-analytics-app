import {handleGroup, handleIdentify, handleTrackEvent} from "./dispatcher";

export const trackEvent = async ({ payload, context }) => {
    await handleTrackEvent(context.accountId, payload.event);
}

export const identify = async ({ context }) => {
    await handleIdentify(
        context.accountId,
        context.cloudId,
        {
            name: context.accountId,
        }
    );
}

export const group = async ({ context }) => {
    await handleGroup(context.cloudId, {name: context.cloudId});
}