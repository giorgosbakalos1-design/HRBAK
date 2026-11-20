const CACHE_NAME = 'hrbak-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    let data = {
        title: 'HRBAK - Νέα Αίτηση',
        body: 'Υπάρχει νέα αίτηση υποψηφίου προς έγκριση.',
        badgeCount: 1,
        url: './'
    };

    if (event.data) {
        try {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const badgePromise = (self.registration && typeof self.registration.setAppBadge === 'function')
        ? self.registration.setAppBadge(Number(data.badgeCount) || 1).catch(() => {})
        : Promise.resolve();

    const notifPromise = self.registration.showNotification(data.title, {
        body: data.body,
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: 'hrbak-pending-application',
        renotify: true,
        data: { url: data.url || './' }
    });

    event.waitUntil(Promise.all([badgePromise, notifPromise]));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || './';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    return;
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
