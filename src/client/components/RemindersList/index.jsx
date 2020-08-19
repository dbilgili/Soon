/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';
import classnames from 'classnames';

import Cross from '../../assets/icons/cross.svg';
import Refresh from '../../assets/icons/refresh.svg';
import styles from './styles.sass';

const { ipcRenderer } = window.require('electron');

class RemindersList extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedId: -1,
      shake: false,
    };

    this.repeatWhen = React.createRef();
    this.shakeTimeout = null;
  }

  componentWillMount() {
    ipcRenderer.removeListener('REPEAT_FAILED', () => {
      this.setShake();
    });

    ipcRenderer.removeListener('NOTIFICATION_ADDED', () => {
      this.setState({ selectedId: -1 });
    });
  }

  componentDidMount() {
    ipcRenderer.on('REPEAT_FAILED', () => {
      this.setShake();
    });

    ipcRenderer.on('NOTIFICATION_ADDED', () => {
      this.setState({ selectedId: -1 });
    });
  }

  componentDidUpdate() {
    const { selectedId } = this.state;

    if (selectedId !== -1) {
      this.repeatWhen.current.focus();
    }
  }

  setShake = () => {
    if (!this.shakeTimeout) {
      this.setState({
        shake: true
      }, this.clearShake);
    }
  }

  clearShake = () => {
    this.shakeTimeout = setTimeout(() => {
      this.setState({
        shake: false,
      });
      this.shakeTimeout = null;
    }, 500);
  }

  onRepeatChange = () => {
    const { shake } = this.state;
    if (shake) {
      this.setState({ shake: false });
    }
  };

  onRepeatSubmit = (e) => {
    const { value } = this.repeatWhen.current;
    const { selectedId } = this.state;

    if (e.keyCode === 13 && value.length) {
      ipcRenderer.send('REPEAT_REMINDER', {
        id: selectedId,
        time: value,
      });
    }
  };

  toggleSelectedId = (e, id) => {
    e.preventDefault();
    const { selectedId } = this.state;

    if (e.button === 0) {
      if (selectedId === -1) {
        this.setState({ selectedId: id });
      } else {
        this.setState({ selectedId: -1 });
      }
    }
  }

  getTime = (timeStamp) => {
    const date = new Date(timeStamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();

    minutes = /^\d$/.test(minutes) ? `0${minutes}` : minutes;
    hours = /^\d$/.test(hours) ? `0${hours}` : hours;

    return `${hours}:${minutes}`;
  };

  tippyTheme = (theme) => {
    if (theme === 'dark') {
      return (
        {
          backgroundColor: 'black',
          boxShadow: '0px 3px 22px 0px rgba(20,20,20,1)',
          color: 'white'
        }
      );
    }
    return (
      {
        backgroundColor: 'white',
        boxShadow: '0px 3px 22px 0px rgba(184,184,184,1)',
        color: 'black'
      }
    );
  };

  renderReminders = () => {
    const {
      reminders,
      deleteItem,
      darkMode,
    } = this.props;

    const { selectedId, shake } = this.state;

    if (reminders.length) {
      return (
        reminders.slice(0).reverse().map((reminder, id) => (
          <div
            key={`reminder-${id}`}
            className={classnames(
              styles.reminder,
              reminder.isExpired && styles.expired
            )}
          >
            <button
              type="button"
              className={styles.delete}
              onClick={() => deleteItem(id)}
            >
              <Cross />
            </button>
            {
              reminder.isExpired && (
                <button
                  type="button"
                  className={styles.refresh}
                  onMouseDown={e => this.toggleSelectedId(e, id)}
                >
                  <Refresh />
                </button>
              )
            }
            <Tippy
              content={(
                <div style={{
                  padding: '1px 10px',
                  borderRadius: '5px',
                  maxWidth: '320px',
                  ...this.tippyTheme(darkMode ? 'dark' : '')
                }}
                >
                  {`[${this.getTime(reminder.timeStamp)}] - ${reminder.message}`}
                </div>
              )}
              followCursor
              plugins={[followCursor]}
              duration={0}
            >
              <div className={styles.message}>
                {
                  selectedId !== id
                    ? <span>{reminder.message}</span>
                    : (
                      <input
                        ref={this.repeatWhen}
                        placeholder="When to repeat?"
                        className={classnames(
                          styles.repeatWhen,
                          shake ? styles.shake : ''
                        )}
                        onBlur={() => this.setState({ selectedId: -1 })}
                        onKeyUp={this.onRepeatSubmit}
                        onChange={this.onRepeatChange}
                      />
                    )
                }
              </div>
            </Tippy>
          </div>
        ))
      );
    }

    return (
      <div>
        No active or expired reminders
      </div>
    );
  };


  render() {
    const { reminders, darkMode } = this.props;

    return (
      <div
        className={classnames(
          styles.remindersList,
          !reminders.length ? styles.noReminder : '',
          darkMode ? styles.darkMode : '',
        )}
      >
        {this.renderReminders()}
      </div>
    );
  }
}

RemindersList.propTypes = {
  reminders: PropTypes.arrayOf(PropTypes.any).isRequired,
  deleteItem: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default RemindersList;
