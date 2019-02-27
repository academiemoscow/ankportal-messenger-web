class EventDispatcher {

	subscribers = [];

	tellSubscribers(message) {
		let args = Object.values(arguments).slice(1);
		this.subscribers.forEach(function(subscriber) {
			if (typeof subscriber[message] === "function") {
				subscriber[message](...args);
			}
		})
	}

	subscribe(subscriber) {
		this.subscribers.push(subscriber);
	}

	dispatch(eventType, event) {
		this.tellSubscribers(eventType, event);
	}
}

export default new EventDispatcher();