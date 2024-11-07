import EventEmitter from "events";

const topics = new EventEmitter();

export const subscribe = (topic: string, callback: (...args: any[]) => void) => {
	topics.on(topic, callback);
};

export const unsubscribe = (topic: string, callback?: (...args: any[]) => void) => {
	topics.off(topic, callback ? callback : () => {});
};

export const publish = (topic: string, ...args: any[]) => {
	topics.emit(topic, ...args);
};

export const Topic = {
	subscribe,
	unsubscribe,
	publish,
};
