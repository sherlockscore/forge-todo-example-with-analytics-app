import {invoke} from "@forge/bridge";

const track = (eventName) => {
    invoke('track-event', {event: eventName});
}

export const trackTodoItemsLoaded = () => {
    track('Todo Items Loaded');
}

export const identify = () => {
    invoke('identify');
}

export const group = () => {
    invoke('group');
}