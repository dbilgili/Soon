/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut
} = require('electron');
const { is } = require('electron-util');
const Store = require('electron-store');
const path = require('path');
const TrayGenerator = require('./TrayGenerator');

const Notification = require('./Notification');

const gotTheLock = app.requestSingleInstanceLock();

const store = new Store();
// store.clear();

const initStore = () => {
  if (!store.get('notifications')) {
    store.set('notifications', []);
  }
  if (store.get('launchAtStart') === undefined) {
    store.set('launchAtStart', true);
  }
  if (store.get('darkModeOn') === undefined) {
    store.set('darkModeOn', false);
  }
  if (store.get('welcomeMessage') === undefined) {
    store.set('welcomeMessage', true);
  }
};

let mainWindow;
let Tray;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    transparent: true,
    width: 340,
    height: 162,
    frame: false,
    show: false,
    icon: path.join(__dirname, './assets/notification_icon.png'),
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      devTools: is.development,
      nodeIntegration: true,
      backgroundThrottling: false
    }
  });

  if (is.development) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../../build/index.html')}`);
  }

  mainWindow.on('focus', () => {
    globalShortcut.register('Command+R', () => null);
    mainWindow.webContents.send('WINDOW_VISIBLE');
  });

  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
      globalShortcut.unregister('Command+R');
      mainWindow.webContents.send('WINDOW_VISIBLE');
    }
    if (store.get('clearOnBlur')) {
      mainWindow.webContents.send('CLEAR_TEXT_AREA');
    }
  });
};

const shouldWatch = () => {
  const notifications = store.get('notifications');

  if (!notifications.length || notifications.every(item => item.isExpired === true)) {
    return false;
  }
  return true;
};

if (!gotTheLock) {
  app.quit();
} else {
  app.on('ready', () => {
    const { powerMonitor } = require('electron');

    initStore();
    createMainWindow();
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('DARK_MODE', store.get('darkModeOn'));
    });

    Tray = new TrayGenerator(mainWindow, store);
    Tray.createTray();

    const notification = new Notification(mainWindow, store);

    if (store.get('welcomeMessage')) {
      notification.welcomeMessage();
      store.set('welcomeMessage', false);
    }

    if (shouldWatch()) {
      notification.startWatching();
    }

    powerMonitor.on('resume', () => {
      // To make sure the timer functions properly.
      if (shouldWatch()) {
        notification.startWatching();
      }
    });

    ipcMain.on('ADD_REMINDER', (event, data) => {
      notification.add(data);
      if (shouldWatch()) {
        notification.startWatching();
      }
    });

    ipcMain.on('REPEAT_REMINDER', (evet, data) => {
      notification.repeat(data);
      if (shouldWatch()) {
        notification.startWatching();
      }
    });

    ipcMain.on('DELETE_ITEM', (event, id) => {
      notification.delete(id);
      if (!shouldWatch()) {
        notification.stopWatching();
      }
    });
  });

  app.on('second-instance', () => {
    if (mainWindow) {
      Tray.showWindow();
    }
  });

  if (!is.development) {
    app.setLoginItemSettings({
      openAtLogin: store.get('launchAtStart'),
    });
  }

  app.dock.hide();
}
