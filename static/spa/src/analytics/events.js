import {invoke} from "@forge/bridge";

const track = (eventName) => {
    invoke('track-event', {event: eventName});
}

export const trackDeleteAll = () => {
    track('Delete All Todo Items');
}

export const trackTodoItemDeleted = () => {
    track('Todo Item Deleted');
}

export const trackTodoItemCreated = () => {
    track('Todo Item Created');
}

export const trackTodoItemChecked = () => {
    track('Todo Item Checked');
}

export const trackTodoItemUnchecked = () => {
    track('Todo Item Unchecked');
}

export const identify = () => {
    invoke('identify');
}

export const group = () => {
    invoke('group');
}