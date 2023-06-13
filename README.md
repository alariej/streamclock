# StreamClock

An Electron app meant to run on a Linux device (such as a Raspberry Pi), connected via HDMI to a television.

- Bootstrapped with `npm create electron-vite`
- Programmed with `react-native-web`

## Functionality

- **Time**: Shows the local time
- **Music**: Plays an internet radio stream based on a given URL
- **Weather**: Shows the temperature (in Celsius) based on a given latitude and longitude
- **Alarm Clock**: Automatically plays the radio stream at a given time, with volume fade-in
- **Volume Control**: Resets the system volume to a given level (and unmutes) before starting the alarm clock
- **Screensaver**: Shows a fullscreen view, manually or automatically

TODO:

- **Monitor Control**: Turns the monitor automatically on (via HDMI-CEC) before starting the alarm clock, and turns off when alarm stops
- **Tray**: Launch, minimize and close app to tray, so that it keeps running in background
- **Settings Storage**: Use system storage so that settings are persistent between updates
- **Automatic Updates**

## Run dev locally

1. Clone the repo
2. `cd streamclock`
3. `npm i`
4. `npm run dev`

## Build the .AppImage

- `npm run build`

## Install on arm64

This was tested on a Raspberry Pi 4B running Ubuntu 22.04.

- Download the .AppImage file to device
- Copy in Home folder
- Rename file to streamclock.AppImage (optional)
- Change file permissions to "Executable as Program" (GUI)
- or, `chmod a+x streamclock.AppImage`
- Add app to startup programs (command: `./streamclock.AppImage`)
- `sudo apt install zlib1g-dev`
- `sudo apt install libfuse2`
- Start app via command line or file manager, or by rebooting the system

## License

MIT

## Copyright

ⓒ 2023 Jean-François Alarie