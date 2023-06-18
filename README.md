# StreamClock

An Electron **radio-stream-alarm-clock** app meant to run on a Linux device (such as a Raspberry Pi), connected via HDMI to a television

- Bootstrapped with `npm create electron-vite`
- Programmed with `react-native-web`

## Functionality

- **Time**: Shows the local time
- **Music**: Plays an internet radio stream based on a given URL, shows the current song title and station metadata if available
- **Weather**: Shows the local temperature (in Celsius) based on a given latitude and longitude (and up to four temperatures on the screensaver)
- **Alarm Clock**: Automatically plays the radio stream at a given time, with volume fade-in, and automatically stops it after 20 minutes
- **Volume Control**: Unmutes and sets the system volume to a given level before starting the alarm clock
- **HDMI-CEC**: Turns the television on and switches the input source to itself before starting the alarm clock (**Note**: Other CEC devices connected to the television might have to be switched off or CEC-disabled, to prevent CEC conflicts)
- **Screensaver**: Shows a fullscreen view with changing text positioning on a black background, manually or automatically after 60 seconds of idle time (**Note**: This is not a real system-wide screensaver, as user activity outside of the app is ignored)

## Run dev locally

1. Clone the repo
2. `cd streamclock`
3. `npm i`
4. `npm run dev`

## Build the .AppImage

- `npm run build` (this must be done on a system with the same architecture as the target device)

## Install on Raspberry Pi

This was only tested on a Raspberry Pi 4B running Raspberry Pi OS (Bullseye, 64-bit)

- Download the .AppImage file to device
- Copy in user's home folder (for example, `/home/pi/`)
- Change file permissions to "Executable as Program" (GUI)
- or, `chmod a+x *.AppImage` (command line)
- `sudo apt install zlib1g-dev` (may be required)
- `sudo apt install libfuse2` (may be required)
- `sudo apt install cec-utils` (optional, may be required)
- Add app to startup programs (Add `@./streamclock-arm64.AppImage` at the end of file `/etc/xdg/lxsession/LXDE-pi/autostart`, obviously does not work when activating the experimental Wayland support, optional)
- Start app via command line (`./streamclock-arm64.AppImage`) or file manager

## HDMI-CEC

If the television should be started automatically before the alarm starts, the CEC address of the television must be entered in the app's settings. Usually, the address is "0.0.0.0", but this can be checked by scanning for CEC devices from the Raspberry Pi's terminal, with the `echo 'scan' | cec-client -s -d 1` command (`cec-client` is a program included in `cec-utils`).

## License

MIT

## Copyright

ⓒ 2023 Jean-François Alarie