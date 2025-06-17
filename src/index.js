import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

// Analytics imports for tracking user interactions
import {trackEvent} from "./analytics/resolvers";
import {trackCreate, trackDelete, trackDeleteAll, trackUpdate} from "./analytics/events";

const resolver = new Resolver();

const getUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const getListKeyFromContext = (context) => {
  const { localId: id } = context;
  return id.split('/')[id.split('/').length - 1];
}

const getAll = async (listId) => {
  return await kvs.get(listId) || [];
}

export const getTodoCount = async () => {
  return (await getAll('todo-panel')).length;
}

resolver.define('get-all', async ({ context }) => {
  return getAll(getListKeyFromContext(context));
});

resolver.define('create', async ({ payload, context }) => {
  // Track todo creation for analytics
  await trackCreate(context);

  const listId = getListKeyFromContext(context);
  const records = await getAll(listId);
  const id = getUniqueId();

  const newRecord = {
    id,
    ...payload,
  };

  await kvs.set(getListKeyFromContext(context), [...records, newRecord]);

  return newRecord;
});

resolver.define('update', async ({ payload, context }) => {
  // Track todo updates (e.g., checking/unchecking items) for analytics
  await trackUpdate(context);

  const listId = getListKeyFromContext(context);
  let records = await getAll(listId);

  records = records.map(item => {
    if (item.id === payload.id) {
      return payload;
    }
    return item;
  })

  await kvs.set(getListKeyFromContext(context), records);

  return payload;
});

resolver.define('delete', async ({ payload, context }) => {
  // Track individual todo deletion for analytics
  await trackDelete(context);

  const listId = getListKeyFromContext(context);
  let records = await getAll(listId);

  records = records.filter(item => item.id !== payload.id)

  await kvs.set(getListKeyFromContext(context), records);

  return payload;
});

resolver.define('delete-all', async ({ context }) => {
  // Track bulk deletion for analytics
  await trackDeleteAll(context);

  return kvs.set(getListKeyFromContext(context), []);
});

// Register analytics resolvers for frontend-triggered events
// Primary resolver: track-event (used for all event tracking)
resolver.define('track-event', trackEvent);

// Example resolvers: identify and group (typically not used)
// These are provided as examples but are generally unnecessary since:
// - identify/group calls are automatically handled by track events
// - scheduled jobs handle regular group updates with license data
// Uncomment if you need explicit identify/group calls from frontend:
// resolver.define('identify', identify);
// resolver.define('group', group);

export const handler = resolver.getDefinitions();