import {handleGroup, handleIdentify, handleTrackEvent} from "./dispatcher";
import {track} from "./events";

export const trackEvent = async ({ payload, context }) => {
    await track(context, payload.event);
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