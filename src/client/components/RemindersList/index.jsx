/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';
import classnames from 'classnames';

import Cross from '../../assets/icons/cross.svg';
import styles from './styles.sass';

const RemindersList = (props) => {
  const { reminders, deleteItem, darkMode } = props;

  const getTime = (timeStamp) => {
    const date = new Date(timeStamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();

    minutes = /^\d$/.test(minutes) ? `0${minutes}` : minutes;
    hours = /^\d$/.test(hours) ? `0${hours}` : hours;

    return `${hours}:${minutes}`;
  };

  const tippyTheme = (theme) => {
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

  const renderReminders = () => {
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
              onClick={() => deleteItem(id)}
            >
              <Cross />
            </button>
            <Tippy
              content={(
                <div style={{
                  padding: '1px 10px',
                  borderRadius: '5px',
                  maxWidth: '320px',
                  ...tippyTheme(darkMode ? 'dark' : '')
                }}
                >
                  {`[${getTime(reminder.timeStamp)}] - ${reminder.message}`}
                </div>
              )}
              followCursor
              plugins={[followCursor]}
              duration={0}
            >
              <span>{reminder.message}</span>
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

  return (
    <div
      className={classnames(
        styles.remindersList,
        !reminders.length ? styles.noReminder : '',
        darkMode ? styles.darkMode : '',
      )}
    >
      {renderReminders()}
    </div>
  );
};

RemindersList.propTypes = {
  reminders: PropTypes.arrayOf(PropTypes.any).isRequired,
  deleteItem: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default RemindersList;
