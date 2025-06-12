import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';
import {group, identify, trackEvent} from "./analytics/resolvers";
import {dailyGroupAnalytics} from "./analytics/schedule";

const resolver = new Resolver();

const getUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const getListKeyFromContext = (context) => {
  const { localId: id } = context;
  return id.split('/')[id.split('/').length - 1];
}

const getAll = async (listId) => {
  return await kvs.get(listId) || [];
}

resolver.define('get-all', ({ context }) => {
  return getAll(getListKeyFromContext(context));
});

resolver.define('create', async ({ payload, context }) => {
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
  const listId = getListKeyFromContext(context);
  let records = await getAll(listId);

  records = records.filter(item => item.id !== payload.id)

  await kvs.set(getListKeyFromContext(context), records);

  return payload;
});

resolver.define('delete-all', ({ context }) => {
  return kvs.set(getListKeyFromContext(context), []);
});

// Analytics resolvers

resolver.define('track-event', trackEvent);
resolver.define('identify', identify);
resolver.define('group', group);

export const handler = resolver.getDefinitions();

export const dailyAnalytics = dailyGroupAnalytics;