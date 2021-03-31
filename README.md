<p align="center">
  <img src="https://github.com/dbilgili/Soon/blob/files/images/logo.svg?sanitize=true" height="70" width="70">
  <h3 align="center">Soon</h3>
  <p align="center"><a href="https://github.com/dbilgili/Soon/releases/download/1.0.2/Soon-1.0.2.dmg.zip">Download the latest version</a><p>
</p>

Alternatively, you can clone the repository and build the app on your own by running `npm run build` and `npm run dist` commands consecutively.

## About _Soon_

<img width="920" alt="screenshot" src="https://github.com/dbilgili/Soon/blob/files/images/screenrecording.gif?raw=true">

_Soon_ is a simplistic reminder application for macOS menubar to quickly add small post-it like reminders.
When the time comes, _Soon_ sends a system notification to remind your note.

You can define the duration for a reminder in seconds, minutes or hours.

Below the list of valid duration input identifiers.

```
'sec', 'sec.', 'secs', 'secs.', 'second', 'seconds'
'min', 'min.', 'mins', 'mins.', 'minute', 'minutes'
'hr', 'hr.', 'hrs', 'hrs.', 'hour', 'hours'
```

All these duration identifiers can start with `every` keyword to set a periodic reminder.

Some input examples for duration (Only integers are valid as a number).

```
1 hr
20min.
30seconds
Every 10 min
```
