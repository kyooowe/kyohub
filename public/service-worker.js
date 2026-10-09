self.addEventListener("push", (event) => {
	let notification = {
		title: "Baby reminders for tomorrow",
		body: "You have a baby reminder tomorrow.",
		url: "/baby-needs",
	};
	if (event.data) {
		try {
			notification = { ...notification, ...event.data.json() };
		} catch {
			notification.body = event.data.text();
		}
	}
	event.waitUntil(self.registration.showNotification(notification.title, {
		body: notification.body,
		icon: "/icons/icon-192.png",
		badge: "/icons/icon-192.png",
		data: { url: notification.url },
	}));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const target = new URL(event.notification.data?.url ?? "/baby-needs", self.location.origin).href;
	event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
		const client = clients.find((windowClient) => windowClient.url === target);
		return client ? client.focus() : self.clients.openWindow(target);
	}));
});
