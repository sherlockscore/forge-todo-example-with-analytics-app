import {handleTrackEvent} from "./dispatcher";
import Resolver from "@forge/resolver";

const resolver = new Resolver();

resolver.define('analytics-listener', async ({ payload }) => {
    await handleTrackEvent(payload.userId, payload.event);
});

export const handler = resolver.getDefinitions();