import { app, BrowserWindow } from 'electron';
import path from 'node:path';

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
			autoplayPolicy: 'no-user-gesture-required',
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	// Test active push message to Renderer-process.
	win.webContents.on('did-finish-load', () => {
		win?.webContents.send('main-process-message', new Date().toLocaleString());
	});

	/*   
	win.webContents.on('ipc-message', () => {
    win?.webContents
		.executeJavaScript('document.getElementById("fullscreenview").requestFullScreen()', true)
		.then(console.log)
		.catch(console.log);
	});
  */

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		// win.loadFile('dist/index.html')
		win.loadFile(path.join(process.env.DIST, 'index.html'));
	}
}

app.on('window-all-closed', () => {
	win = null;
});

app.whenReady().then(createWindow);
