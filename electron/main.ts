import { app, BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import path from 'node:path';
import * as loudness from '@matthey/loudness';
import Store from 'electron-store';
import * as child from 'node:child_process';

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist');
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
	win = new BrowserWindow({
		width: 960,
		height: 620,
		resizable: true,
		autoHideMenuBar: true,
		frame: true,
		movable: true,
		backgroundColor: '#fff',
		icon: path.join(process.env.PUBLIC, 'logo.png'),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			autoplayPolicy: 'no-user-gesture-required',
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	// useless, still need two clicks on first interaction with app
	/* 
	win.webContents.on('did-finish-load', () => {
		setTimeout(() => {
			win?.webContents.focus();
		}, 1000);
	});
	*/

	ipcMain.on('reset-main-volume', (_event, volume) => {
		loudness.setMuted(false);
		setTimeout(() => {
			loudness.setVolume(volume);
		}, 100);
	});

	ipcMain.on('turn-on-cec', (_event, CECAddress) => {
		const turnOn = 'echo "on ' + CECAddress + '" | cec-client -s -d 1';
		child.exec(turnOn);
		// not sure why this rechanges the source to previous source
		/*
		const changeSource = 'echo "as" | cec-client -s -d 1';

		setTimeout(() => {
			child.exec(changeSource);
		}, 5 * 1000);
		*/
	});

	ipcMain.on('enter-fullscreen', () => {
		win?.webContents.executeJavaScript('document.getElementById("fullscreenview").requestFullscreen()', true);
	});

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		win.loadFile(path.join(process.env.DIST, 'index.html'));
	}
}

app.on('window-all-closed', () => {
	win = null;
});

// useless, media buttons on remote control still not working
// app.commandLine.appendSwitch('enable-features', 'HardwareMediaKeyHandling, MediaSessionService');

app.whenReady().then(() => {
	Store.initRenderer();
	createWindow();
});
