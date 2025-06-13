import {handleGroup, handleIdentify, handleTrackEvent} from "./dispatcher";
import {track} from "./events";
import {groupIdFromContext, userIdFromContext} from "./utils";

export const trackEvent = async ({ payload, context }) => {
    await track(context, payload.event);
}

export const identify = async ({ context }) => {
    const userId = userIdFromContext(context);
    const groupId = groupIdFromContext(context);
    await handleIdentify(
        userId,
        groupId,
        {
            name: userId,
        }
    );
}

export const group = async ({ context }) => {
    const groupId = groupIdFromContext(context);
    await handleGroup(groupId, {name: groupId});
}