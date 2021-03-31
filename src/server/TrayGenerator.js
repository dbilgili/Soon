/* eslint-disable import/no-extraneous-dependencies */
const { app, Tray, Menu } = require('electron');
const path = require('path');

class TrayGenerator {
  constructor(mainWindow, store) {
    this.tray = null;
    this.mainWindow = mainWindow;
    this.store = store;
  }

  getWindowPosition = () => {
    const windowBounds = this.mainWindow.getBounds();
    const trayBounds = this.tray.getBounds();
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
    const y = Math.round(trayBounds.y + trayBounds.height);
    return { x, y };
  };

  showWindow = () => {
    const position = this.getWindowPosition();
    this.mainWindow.setPosition(position.x, position.y, false);
    this.mainWindow.setVisibleOnAllWorkspaces(true);
    this.mainWindow.show();
    this.mainWindow.setVisibleOnAllWorkspaces(false);
  };

  toggleWindow = () => {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.showWindow();
    }
  };

  rightClickMenu = () => {
    const menu = [
      {
        label: 'Dark mode',
        type: 'checkbox',
        checked: this.store.get('darkModeOn'),
        click: (event) => {
          this.store.set('darkModeOn', event.checked);
          this.mainWindow.webContents.send('DARK_MODE', event.checked);
        },
      },
      {
        label: 'Launch at startup',
        type: 'checkbox',
        checked: this.store.get('launchAtStart'),
        click: (event) => {
          this.store.set('launchAtStart', event.checked);
          app.setLoginItemSettings({
            openAtLogin: event.checked,
          });
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'quit',
        accelerator: 'Command+Q'
      },
    ];
    this.tray.popUpContextMenu(Menu.buildFromTemplate(menu));
  }

  createTray = () => {
    this.tray = new Tray(path.join(__dirname, './assets/IconTemplate.png'));
    this.tray.setIgnoreDoubleClickEvents(true);

    this.tray.on('click', this.toggleWindow);
    this.tray.on('right-click', this.rightClickMenu);
  };
}

module.exports = TrayGenerator;
