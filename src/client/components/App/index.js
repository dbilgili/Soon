import React from 'react';
import classnames from 'classnames';
import AddReminder from '../AddReminder';
import RemindersList from '../RemindersList';

import Back from '../../assets/icons/back.svg';
import MoreIcon from '../../assets/icons/more.svg';

import styles from './styles.sass';

const { ipcRenderer } = window.require('electron');

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      showList: false,
      darkMode: false,
      reminders: [],
    };
  }

  componentDidMount() {
    ipcRenderer.on('NOTIFICATION_ADDED', (event, args) => {
      this.updateList(args);
    });

    ipcRenderer.on('EXISTING_NOTIFICATIONS', (event, args) => {
      this.updateList(args);
    });

    ipcRenderer.on('NOTIFICATION_EXPIRED', (event, args) => {
      this.updateList(args);
    });

    ipcRenderer.on('DARK_MODE', (event, args) => {
      this.setState({ darkMode: args });
    });

    ipcRenderer.on('WINDOW_VISIBLE', this.onWindowVisible);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('NOTIFICATION_ADDED', (event, args) => {
      this.updateList(args);
    });

    ipcRenderer.removeListener('EXISTING_NOTIFICATIONS', (event, args) => {
      this.updateList(args);
    });

    ipcRenderer.removeListener('NOTIFICATION_EXPIRED', (event, args) => {
      this.updateList(args);
    });

    ipcRenderer.removeListener('DARK_MODE', (event, args) => {
      this.setState({ darkMode: args });
    });

    ipcRenderer.removeListener('WINDOW_VISIBLE', this.onWindowVisible);
  }

  onWindowVisible = () => {
    this.setState({ showList: false });
  }

  updateList = (reminders) => {
    this.setState({
      reminders
    });
  }

  toggleList = () => {
    this.setState(prevState => ({
      showList: !prevState.showList
    }));
  }

  deleteItem = (id) => {
    const { reminders } = this.state;
    if (id === 'all' || id === 'expired') {
      ipcRenderer.send('DELETE_ITEM', id);
    } else {
      ipcRenderer.send('DELETE_ITEM', reminders.length - 1 - id);
    }
  }

  getNumberOfReminders = (type) => {
    const { reminders } = this.state;
    if (type === 'all') {
      return reminders.length;
    }
    return reminders.filter(item => item.isExpired === true).length;
  }

  render() {
    const { showList, reminders, darkMode } = this.state;

    if (darkMode) {
      document.getElementById('arrow').classList.add('darkMode');
    } else {
      document.getElementById('arrow').classList.remove('darkMode');
    }

    return (
      <div className={classnames(
        styles.app,
        darkMode ? styles.darkMode : ''
      )}
      >
        {
          showList
            ? (
              <RemindersList
                reminders={reminders}
                deleteItem={this.deleteItem}
                darkMode={darkMode}
              />
            )
            : <AddReminder darkMode={darkMode} />
        }
        {
          showList
            ? (
              <>
                <Back
                  className={classnames(
                    styles.toggleButton,
                    darkMode ? styles.darkMode : ''
                  )}
                  onClick={this.toggleList}
                />
                {!!reminders.length && (
                <div className={styles.removeButtonsWrapper}>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => this.deleteItem('all')}
                  >
                    {`Remove All ( ${this.getNumberOfReminders('all')} )`}
                  </button>
                  <button
                    type="button"
                    className={classnames(
                      styles.removeButton,
                      !this.getNumberOfReminders('expired') && styles.inActive
                    )}
                    onClick={() => this.deleteItem('expired')}
                  >
                    {`Remove Expired ( ${this.getNumberOfReminders('expired')} )`}
                  </button>
                </div>
                )}
              </>
            )
            : (
              <MoreIcon
                className={classnames(
                  styles.toggleButton,
                  darkMode ? styles.darkMode : ''
                )}
                onClick={this.toggleList}
              />
            )
        }
      </div>
    );
  }
}

export default App;
