import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron';
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

let tray: Tray | null;
// let doQuit = false;

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

	// commented out due to systray issue on Debian Bullseye
	/* 
	win.on('minimize', (e: Event) => {
		e.preventDefault();
		win?.hide();
	});

	win.on('close', (e: Event) => {
		if (doQuit || VITE_DEV_SERVER_URL) {
			win = null;
			tray?.destroy();
			app.quit();
		} else {
			e.preventDefault();
			win?.hide();
		}
	});
	*/

	win.on('close', () => {
		tray?.destroy();
	});

	ipcMain.on('reset-main-volume', (_event, volume) => {
		loudness.setMuted(false);
		setTimeout(() => {
			loudness.setVolume(volume);
		}, 100);
	});

	ipcMain.on('set-alarm-tray', (_event, isAlarm) => {
		if (isAlarm) {
			tray?.setImage(nativeImage.createFromPath(path.join(process.env.PUBLIC, 'alarm.png')));
		} else {
			tray?.setImage(nativeImage.createFromPath(path.join(process.env.PUBLIC, 'logo.png')));
		}
	});

	ipcMain.on('turn-on-cec', (_event, CECAddress) => {
		const turnOn = 'echo "on ' + CECAddress + '" | cec-client -s -d 1';
		child.exec(turnOn);

		const changeSource = 'echo "as" | cec-client -s -d 1';
		setTimeout(() => {
			child.exec(changeSource);
		}, 5 * 1000);
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

// useless, still get CORS errors reading stream URLs in dev mode
// app.commandLine.appendSwitch('disable-site-isolation-trials');
// app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
// app.commandLine.appendSwitch('disable-features', 'BlockInsecurePrivateNetworkRequests');

// useless, media buttons on remote control still not working
// app.commandLine.appendSwitch('enable-features', 'HardwareMediaKeyHandling, MediaSessionService');

// useless, still can't click on tray icon in Debian Bullseye
// app.commandLine.appendSwitch('enable-features', 'EnableDbusAndX11StatusIcons');

app.on('second-instance', () => {
	win?.show();
});

const showApp = () => {
	win?.show();
};

const quitApp = () => {
	win = null;
	tray = null;
	// doQuit = true;
	app.quit();
};

app.whenReady().then(() => {
	const icon = nativeImage.createFromPath(path.join(process.env.PUBLIC, 'logo.png'));
	tray = new Tray(icon);

	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Show StreamClock', type: 'normal', click: showApp },
		{ label: 'Quit StreamClock', type: 'normal', click: quitApp },
	]);

	tray.setContextMenu(contextMenu);
	tray.setToolTip('StreamClock');

	Store.initRenderer();
	createWindow();
});
