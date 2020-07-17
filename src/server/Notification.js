/* eslint-disable class-methods-use-this */
// eslint-disable-next-line import/no-extraneous-dependencies
const { Notification } = require('electron');

class NotificationHandler {
  constructor(mainWindow, store) {
    this.mainWindow = mainWindow;
    this.store = store;
    this.timerId = null;
    this.notifications = store.get('notifications');

    this.mainWindow.webContents.on('did-finish-load', () => {
      this.mainWindow.webContents.send('EXISTING_NOTIFICATIONS', this.notifications);
    });
  }

  shouldWatch = () => {
    const notifications = this.store.get('notifications');

    if (!notifications.length || notifications.every(item => item.isExpired === true)) {
      return false;
    }
    return true;
  };

  welcomeMessage = () => {
    const options = {
      title: 'Welcome to Soon!',
    };

    new Notification(options).show();
  }

  startWatching = () => {
    if (this.timerId !== null) {
      this.stopWatching();
    }

    this.timerId = setInterval(() => {
      if (!this.shouldWatch()) {
        this.stopWatching();
      }

      this.notifications.forEach((notification, index) => {
        const { message, timeStamp, isExpired } = notification;

        if (timeStamp <= Date.now() && !isExpired) {
          this.notifications[index].isExpired = true;
          this.store.set('notifications', this.notifications);

          const options = {
            title: 'Soon is now!',
            body: message,
          };

          new Notification(options).show();

          this.mainWindow.webContents.send('NOTIFICATION_EXPIRED', this.notifications);
        }
      });
    }, 1000);
  }

  stopWatching = () => {
    clearInterval(this.timerId);
  };

  extractIdentifier = (timeString) => {
    const identifier = timeString.split(/([0-9]+)/)[2];

    if (identifier) {
      return identifier.replace(/\s/g, '').toLowerCase();
    }
    return null;
  };

  resolveTimeStamp = (timeString) => {
    let duration = 0;

    const checkList = [
      {
        identifiers: ['sec', 'sec.', 'secs', 'secs.', 'second', 'seconds'],
        multiplier: 1000,
      },
      {
        identifiers: ['min', 'min.', 'mins', 'mins.', 'minute', 'minutes'],
        multiplier: 60 * 1000
      },
      {
        identifiers: ['hr', 'hr.', 'hrs', 'hrs.', 'hour', 'hours'],
        multiplier: 60 * 60 * 1000
      }
    ];

    const isValid = checkList.some((list) => {
      if (list.identifiers.includes(this.extractIdentifier(timeString))) {
        duration = timeString.split(/([0-9]+)/)[1] * list.multiplier;
        return true;
      }
      return false;
    });

    return {
      isValid,
      timeStamp: Date.now() + duration
    };
  }


  delete = (id) => {
    if (id === 'all') {
      this.notifications = [];
    } else if (id === 'expired') {
      this.notifications = this.notifications.filter(item => item.isExpired === false);
    } else {
      this.notifications.splice(id, 1);
    }

    this.store.set('notifications', this.notifications);
    this.mainWindow.webContents.send('EXISTING_NOTIFICATIONS', this.notifications);
  }

  add = (data) => {
    const { message, time } = data;
    const { isValid, timeStamp } = this.resolveTimeStamp(time);

    if (isValid && message.length) {
      this.notifications.push(
        {
          message,
          timeStamp,
          isExpired: false,
        }
      );

      this.store.set('notifications', this.notifications);
      this.mainWindow.webContents.send('NOTIFICATION_ADDED', this.notifications);
    } else {
      this.mainWindow.webContents.send('NOTIFICATION_FAILED');
    }
  }
}

module.exports = NotificationHandler;
