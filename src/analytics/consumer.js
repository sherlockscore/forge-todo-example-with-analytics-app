import {handleGroup, handleIdentify, handleTrackEvent} from "./dispatcher";
import Resolver from "@forge/resolver";

const resolver = new Resolver();

resolver.define('analytics-listener', async ({ payload }) => {
    switch (payload.type){
        case "identify":
            await handleIdentify(payload.userId, payload.groupId, payload.traits);
            break;
        case "group":
            await handleGroup(payload.groupId, payload.traits);
            break;
        case "track":
            await handleTrackEvent(payload.userId, payload.event);
            break;
        default:
            console.log(`analytics-listener: unable to process payload with type ${payload.type}`);
    }
});

export const handler = resolver.getDefinitions();