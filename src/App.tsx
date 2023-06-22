import { Component } from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import IcecastMetadataPlayer, { IcyMetadata } from 'icecast-metadata-player';
import {
	alarmIcon,
	checkboxChecked,
	checkboxUnchecked,
	playIcon,
	screensaverIcon,
	settingsIcon,
	stopIcon,
} from './icons';
import Settings from './settings';
import {
	ALARM,
	ALARMONOFF,
	ALARMSTORAGE,
	ALARMTIME,
	ALARMVOLUME,
	APPCOLOR,
	BOTTOM,
	BUTTONCOLOR,
	CHECKEDURL,
	DEFAULTALARMDURATION,
	DEFAULTALARMTIME,
	DEFAULTALARMVOLUME,
	DEFAULTLATITUDE,
	DEFAULTLOCATION,
	DEFAULTLONGITUDE,
	DEFAULTSTREAMURL,
	FONTCOLOR,
	FONTFAMILY,
	FONTSIZE,
	HDMICEC,
	LOC1ID,
	LOC1LAT,
	LOC1LON,
	LOC2ID,
	LOC2LAT,
	LOC2LON,
	LOC3ID,
	LOC3LAT,
	LOC3LON,
	LOC4ID,
	LOC4LAT,
	LOC4LON,
	MARGIN,
	MUSICOFF,
	NOMETADATA,
	OFF,
	ON,
	OPACITYPRESSED,
	PLAY,
	SCREENSAVER,
	SCREENSAVERDELAY,
	SCREENSAVERONOFF,
	SETTINGS,
	SETTINGSSTORAGE,
	STARTINGALARM,
	STARTINGSTREAM,
	STOP,
	STOPPINGALARM,
	STOPPINGSTREAM,
	STREAMURL,
	STREAMURL2,
	STREAMURL3,
	STREAMURL4,
	SettingsData,
	TOP,
} from './uiconfig';
import Store from 'electron-store';
import AlarmSettings from './settingsAlarm';
import { Dimensions } from 'react-native';

const alarmWidth = 140;
const streamTitleHeight = 48;

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	},
	containerApp: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'center',
		backgroundColor: APPCOLOR,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		margin: MARGIN,
	},
	mediaButton: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 64,
		width: 64,
		borderRadius: 64 / 2,
		marginHorizontal: MARGIN / 2,
		backgroundColor: BUTTONCOLOR,
	},
	streamTitle: {
		height: 76,
		margin: MARGIN,
		alignContent: 'center',
		justifyContent: 'center',
	},
	streamTitleText: {
		fontFamily: FONTFAMILY,
		fontSize: 36,
		textAlign: 'center',
		color: FONTCOLOR,
	},
	temperature: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		fontFamily: FONTFAMILY,
		fontSize: FONTSIZE,
		color: FONTCOLOR,
		margin: MARGIN,
	},
	timeOfDay: {
		fontFamily: FONTFAMILY,
		fontSize: 104,
		fontWeight: 'bold',
		textAlign: 'center',
		color: FONTCOLOR,
		margin: MARGIN,
	},
	stationInfo: {
		height: FONTSIZE,
		fontFamily: FONTFAMILY,
		fontSize: FONTSIZE,
		textAlign: 'center',
		color: FONTCOLOR,
		opacity: 0.67,
		margin: MARGIN,
	},
	settings: {
		position: 'absolute',
		top: 0,
		right: 0,
		margin: MARGIN,
	},
	alarm: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		margin: MARGIN,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: alarmWidth,
	},
	alarmText: {
		fontFamily: FONTFAMILY,
		fontSize: FONTSIZE,
		color: FONTCOLOR,
	},
	screensaver: {
		position: 'absolute',
		top: 0,
		left: 0,
		margin: MARGIN,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: alarmWidth,
	},
	alarmBar: {
		position: 'absolute',
		left: 0,
		bottom: 0,
		marginLeft: MARGIN,
		marginBottom: MARGIN - 2,
		height: 2,
		backgroundColor: FONTCOLOR,
		opacity: 0.67,
	},
	containerScreensaver: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'center',
		backgroundColor: 'black',
		cursor: 'none',
	},
	timeOfDayScreensaver: {
		fontFamily: FONTFAMILY,
		fontWeight: 'bold',
		textAlign: 'center',
		color: FONTCOLOR,
	},
	streamTitleScreensaver: {
		height: streamTitleHeight,
		margin: MARGIN,
		alignContent: 'center',
		justifyContent: 'center',
	},
	streamTitleTextScreensaver: {
		textAlign: 'center',
		fontFamily: FONTFAMILY,
		color: FONTCOLOR,
	},
	timeView: {
		flex: 1,
		marginHorizontal: MARGIN,
	},
	temperatureContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	temperatureScreensaver: {
		fontFamily: FONTFAMILY,
		color: FONTCOLOR,
	},
	locationScreensaver: {
		color: FONTCOLOR,
		fontFamily: FONTFAMILY,
		fontWeight: '100',
	},
});

interface CodecInfo {
	bitrate: number;
	sampleRate: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppProps {}

interface AppState {
	temperature: string | undefined;
	pressed: string;
	streamTitle: string;
	stationInfo: string;
	timeOfDay: string;
	checkedAlarm: boolean;
	alarmTime: string;
	checkedScreensaver: boolean;
	volume: number;
	showSettings: boolean;
	showAlarmSettings: boolean;
	isScreensaver: boolean;
	streamTitlePos: string;
}

export default class App extends Component<AppProps, AppState> {
	private intervalMain: NodeJS.Timer | undefined;
	private player!: IcecastMetadataPlayer;
	private withFadeIn = false;
	private stoppingAlarm = false;
	private streamUrl = '';
	private location1 = '';
	private latitude1 = '';
	private longitude1 = '';
	private location2 = '';
	private latitude2 = '';
	private longitude2 = '';
	private temperature2 = '';
	private location3 = '';
	private latitude3 = '';
	private longitude3 = '';
	private temperature3 = '';
	private location4 = '';
	private latitude4 = '';
	private longitude4 = '';
	private temperature4 = '';
	private CECAddress = '';
	private alarmTime = '';
	private alarmVolume = '';
	private alarmDuration = DEFAULTALARMDURATION;
	private settings: SettingsData = {};
	private alarmSettings: SettingsData = {};
	private screensaverHeight = 0;
	private screensaverWidth = 0;
	private timeOfDay = '';
	private top = 0;
	private left = 0;
	private timeoutScreensaver: NodeJS.Timer | undefined;
	private codecUpdate = true;
	private statsError = false;
	private streamTitleInterval: NodeJS.Timer | undefined;

	constructor(props: AppProps) {
		super(props);
		this.state = {
			temperature: undefined,
			pressed: '',
			streamTitle: '',
			stationInfo: '',
			timeOfDay: '',
			checkedAlarm: false,
			checkedScreensaver: false,
			volume: 0,
			showSettings: false,
			showAlarmSettings: false,
			alarmTime: '',
			isScreensaver: false,
			streamTitlePos: TOP,
		};

		this.screensaverWidth = Dimensions.get('screen').width;
		this.screensaverHeight = Dimensions.get('screen').height;
	}

	public async componentDidMount(): Promise<void> {
		const store = new Store();

		const settings = store.get(SETTINGSSTORAGE) as string;
		if (settings) {
			this.settings = JSON.parse(settings);
			this.streamUrl = this.settings[STREAMURL] || DEFAULTSTREAMURL;
			this.location1 = this.settings[LOC1ID] || DEFAULTLOCATION;
			this.latitude1 = this.settings[LOC1LAT] || DEFAULTLATITUDE;
			this.longitude1 = this.settings[LOC1LON] || DEFAULTLONGITUDE;
			this.location2 = this.settings[LOC2ID];
			this.latitude2 = this.settings[LOC2LAT];
			this.longitude2 = this.settings[LOC2LON];
			this.location3 = this.settings[LOC3ID];
			this.latitude3 = this.settings[LOC3LAT];
			this.longitude3 = this.settings[LOC3LON];
			this.location4 = this.settings[LOC4ID];
			this.latitude4 = this.settings[LOC4LAT];
			this.longitude4 = this.settings[LOC4LON];
			this.CECAddress = this.settings[HDMICEC];
		} else {
			this.streamUrl = DEFAULTSTREAMURL;
			this.location1 = DEFAULTLOCATION;
			this.latitude1 = DEFAULTLATITUDE;
			this.longitude1 = DEFAULTLONGITUDE;
		}

		const alarmSettings = store.get(ALARMSTORAGE) as string;
		if (alarmSettings) {
			this.alarmSettings = JSON.parse(alarmSettings);
			this.alarmTime = this.alarmSettings[ALARMTIME] || DEFAULTALARMTIME;
			this.alarmVolume = this.alarmSettings[ALARMVOLUME] || DEFAULTALARMVOLUME;
		} else {
			this.alarmTime = DEFAULTALARMTIME;
			this.alarmVolume = DEFAULTALARMVOLUME;
		}
		this.setState({ alarmTime: this.alarmTime });

		const alarmOnOff = store.get(ALARMONOFF) as string;
		this.setState({ checkedAlarm: alarmOnOff ? alarmOnOff === ON : false });

		const screensaverOnOff = store.get(SCREENSAVERONOFF) as string;
		this.setState({ checkedScreensaver: screensaverOnOff ? screensaverOnOff === ON : false });

		this.startPlayer();

		// doesn't work
		// this.player.addEventListener('codecupdate', onCodecUpdate, { once: true });

		this.setTemperature1();

		this.getTimeOfDay(new Date());
		let lastMinute = -1;

		this.intervalMain = setInterval(() => {
			const date = new Date();
			const timeOfDay = this.getTimeOfDay(date);

			if (this.player.state !== 'playing' && this.alarmTime === timeOfDay) {
				let delay = 1;
				if (this.CECAddress) {
					this.turnOnCEC();
					delay = 12;
				}
				setTimeout(() => {
					this.resetMainVolume();
					this.setState({ streamTitle: STARTINGALARM });
					this.startStream(true);
					this.stopAlarmTimeout();
				}, delay * 1000);
			}

			const thisMinute = date.getMinutes();
			if (thisMinute !== lastMinute && [0, 15, 30, 45].includes(thisMinute)) {
				this.setTemperature1();
				if (this.state.isScreensaver) {
					this.setTemperatureScreenSaver();
				}
				lastMinute = thisMinute;
			}

			this.codecUpdate = true;
		}, 15 * 1000);

		if (screensaverOnOff === ON) {
			this.screensaverCountdown();
		}

		window.addEventListener('click', this.onUserEvent, true);
		window.addEventListener('keypress', this.onUserEvent, true);

		const onPlayKey = (_e: MediaSessionActionDetails) => {
			this.startStream(false);
		};

		const onPauseKey = (_e: MediaSessionActionDetails) => {
			this.stopStream(false);
		};

		// useless, still can't play / pause the stream
		navigator.mediaSession.setActionHandler('play', onPlayKey);
		navigator.mediaSession.setActionHandler('pause', onPauseKey);
	}

	public componentWillUnmount(): void {
		clearInterval(this.intervalMain);
		clearTimeout(this.timeoutScreensaver);
		clearInterval(this.streamTitleInterval);

		this.player.stop();

		this.player.removeEventListener('error', null);
		this.player.removeEventListener('codecupdate', null);
		this.player.removeEventListener('metadata', null);
		this.player.removeEventListener('streamstart', null);
		this.player.removeEventListener('stop', null);

		window.removeEventListener('click', this.onUserEvent, true);
		window.removeEventListener('keypress', this.onUserEvent, true);
	}

	private onUserEvent = (e: MouseEvent | PointerEvent | KeyboardEvent) => {
		const enter = (e as KeyboardEvent).key === 'Enter';
		const click = (e as PointerEvent).type === 'click';

		if (this.state.isScreensaver && (enter || click)) {
			this.closeScreenSaver();
		}

		if (this.state.checkedScreensaver) {
			clearTimeout(this.timeoutScreensaver);
			this.screensaverCountdown();
		}
	};

	private startPlayer = () => {
		this.player = new IcecastMetadataPlayer(this.streamUrl, {
			onMetadata: this.onMetadata,
			onStreamStart: this.onStreamStart,
			onCodecUpdate: this.onCodecUpdate,
			onError: this.onError,
			onStop: this.onStop,
			metadataTypes: ['icy'],
		});
	};

	private onStop = () => {
		this.setState({ streamTitle: '', stationInfo: '' });
	};

	private onMetadata = (metadata: IcyMetadata) => {
		if (!this.stoppingAlarm) {
			this.setState({ streamTitle: metadata.StreamTitle || NOMETADATA });
			if (this.state.isScreensaver) {
				this.setState({ streamTitlePos: Math.random() > 0.5 ? TOP : BOTTOM });
			}
		}
	};

	private onStreamStart = () => {
		if (this.withFadeIn) {
			this.fadeIn();
		}
	};

	private onError = (message: string, error?: Error): void => {
		this.setState({ streamTitle: '( ' + (error?.message || message.toString()) + ' )' });
	};

	private getStatsUrl = (): string => {
		// this fucking crap doesn't work
		// FIX ME
		const urlMatch = this.streamUrl.match(/.*\//);
		const baseUrl = urlMatch?.length ? urlMatch[0] : '';
		return baseUrl ? baseUrl + 'status-json.xsl' : '';
	};

	private onCodecUpdate = async (codecInfo: object) => {
		const codecInfo_ = codecInfo as CodecInfo;

		if (this.codecUpdate) {
			this.codecUpdate = false;
			const statsUrl = this.getStatsUrl();

			let host = '';
			let location = '';
			if (statsUrl && !this.statsError) {
				await fetch(statsUrl)
					.then(async response => {
						if (response.status !== 200) {
							this.statsError = true;
						} else {
							const stats = await response.json().catch(() => null);
							host = stats?.icestats?.host;
							location = stats?.icestats?.location;
						}
					})
					.catch(() => {
						this.statsError = true;
					});
			}

			this.setState({
				stationInfo:
					(host ? host + '  ⋯  ' : '') +
					(location ? location + '  ⋯  ' : '') +
					codecInfo_.bitrate.toString() +
					' kb/s, ' +
					codecInfo_.sampleRate.toString() +
					' Hz',
			});
		}
	};

	private startStream = (withFadeIn: boolean) => {
		this.setState({ pressed: PLAY, streamTitle: STARTINGSTREAM });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
		setTimeout(() => {
			if (this.state.streamTitle === STARTINGSTREAM) {
				this.setState({ streamTitle: NOMETADATA });
			}
		}, 10 * 1000);

		if (withFadeIn) {
			this.withFadeIn = true;
		} else {
			this.player.audioElement.volume = 1;
		}

		this.player.play();
	};

	private stopStream = (withFadeOut: boolean) => {
		this.setState({ pressed: STOP, streamTitle: STOPPINGSTREAM });
		this.withFadeIn = false;
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);

		if (withFadeOut) {
			this.fadeOut();
		} else {
			this.player.stop();
			this.stoppingAlarm = false;
			this.setState({ streamTitle: '', stationInfo: '', volume: 0 });
		}
	};

	private resetMainVolume = () => {
		const { ipcRenderer } = window.require('electron');
		const volume = Number(this.alarmVolume) || Number(DEFAULTALARMVOLUME);
		ipcRenderer.send('reset-main-volume', volume);
	};

	private turnOnCEC = () => {
		const { ipcRenderer } = window.require('electron');
		ipcRenderer.send('turn-on-cec', this.CECAddress);
	};

	private fadeIn = () => {
		this.player.audioElement.volume = 0;
		const fadeInSeconds = 30;
		const fadeInSteps = fadeInSeconds * 5;
		let i = 0;
		const interval = setInterval(() => {
			i++;
			const volume = i / fadeInSteps;
			this.player.audioElement.volume = volume;
			this.setState({ volume: volume });
			if (i >= fadeInSteps) {
				clearInterval(interval);
			}
		}, (fadeInSeconds * 1000) / fadeInSteps);
	};

	private fadeOut = () => {
		this.player.audioElement.volume = 1;
		const fadeOutSeconds = 15;
		const fadeOutSteps = fadeOutSeconds * 5;
		let i = 0;
		const interval = setInterval(() => {
			i++;
			const volume = (fadeOutSteps - i) / fadeOutSteps;
			this.player.audioElement.volume = volume;
			this.setState({ volume: volume });
			if (i >= fadeOutSteps) {
				clearInterval(interval);
				this.player.stop();
				this.stoppingAlarm = false;
				this.setState({ streamTitle: '', stationInfo: '' });
			}
		}, (fadeOutSeconds * 1000) / fadeOutSteps);
	};

	private getTemperature = async (latitude: string, longitude: string): Promise<string> => {
		const response = await fetch(
			'https://api.open-meteo.com/v1/forecast?latitude=' +
				latitude +
				'&longitude=' +
				longitude +
				'&current_weather=true&forecast_days=1'
		).catch(() => null);

		if (response?.status === 200) {
			const weatherInfo = await response.json().catch(() => null);
			const temperature = weatherInfo.current_weather.temperature;
			let temperature_ = temperature;
			if (Number(temperature) && temperature.toString().indexOf('.') === -1) {
				temperature_ = temperature_ + '.0';
			}
			return Promise.resolve(temperature_ || 'N/A');
		} else {
			return Promise.resolve('N/A');
		}
	};

	private setTemperature1 = async (): Promise<void> => {
		const temperature = await this.getTemperature(this.latitude1, this.longitude1).catch(() => '');
		if (temperature && temperature !== this.state.temperature) {
			this.setState({ temperature: temperature });
		}
		return Promise.resolve();
	};

	private setTemperatureScreenSaver = async (): Promise<void> => {
		if (this.location2) {
			this.temperature2 = await this.getTemperature(this.latitude2, this.longitude2).catch(() => '');
		}
		if (this.location3) {
			this.temperature3 = await this.getTemperature(this.latitude3, this.longitude3).catch(() => '');
		}
		if (this.location4) {
			this.temperature4 = await this.getTemperature(this.latitude4, this.longitude4).catch(() => '');
		}
		return Promise.resolve();
	};

	private getTimeOfDay = (date: Date): string => {
		const timeOfDay = date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: false,
		});

		if (timeOfDay !== this.state.timeOfDay) {
			this.setState({ timeOfDay: timeOfDay });
		}

		return timeOfDay;
	};

	private stopAlarmTimeout = () => {
		setTimeout(() => {
			if (this.player.state !== 'stopped') {
				this.setState({ streamTitle: STOPPINGALARM });
				this.stoppingAlarm = true;
				this.stopStream(true);
			}
		}, this.alarmDuration * 60 * 1000);
	};

	private onPressScreensaver = async () => {
		if (this.location2) {
			await this.setTemperatureScreenSaver().catch(() => null);
		}

		this.setState({ isScreensaver: true });

		const { ipcRenderer } = window.require('electron');
		ipcRenderer.send('enter-fullscreen');

		let lastTitle = this.state.streamTitle;
		this.streamTitleInterval = setInterval(() => {
			if (this.state.isScreensaver && this.state.streamTitle === lastTitle) {
				this.setState({ streamTitlePos: this.state.streamTitlePos === TOP ? BOTTOM : TOP });
				lastTitle = this.state.streamTitle;
			}
		}, 5 * 60 * 1000);
	};

	private onPressSettings = () => {
		this.setState({ showSettings: true, pressed: SETTINGS });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private onPressAlarm = () => {
		this.setState({ showAlarmSettings: true, pressed: ALARM });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private screensaverCountdown = () => {
		this.timeoutScreensaver = setTimeout(() => {
			this.onPressScreensaver();
		}, SCREENSAVERDELAY * 1000);
	};

	private onChangeScreensaverCheckbox = () => {
		const screensaverOnOff = this.state.checkedScreensaver ? OFF : ON;
		const store = new Store();
		store.set(SCREENSAVERONOFF, screensaverOnOff);
		this.setState({ checkedScreensaver: !this.state.checkedScreensaver });

		if (screensaverOnOff === OFF) {
			clearTimeout(this.timeoutScreensaver);
		}
	};

	private onChangeAlarmCheckbox = () => {
		const alarmOnOff = this.state.checkedAlarm ? OFF : ON;
		const store = new Store();
		store.set(ALARMONOFF, alarmOnOff);
		this.setState({ checkedAlarm: !this.state.checkedAlarm });
	};

	private closeSettings = () => {
		const store = new Store();
		const settings = store.get(SETTINGSSTORAGE) as string;
		if (settings) {
			this.settings = JSON.parse(settings);

			let streamUrl;
			if (this.settings[CHECKEDURL]) {
				switch (this.settings[CHECKEDURL]) {
					case '1':
						streamUrl = this.settings[STREAMURL];
						break;

					case '2':
						streamUrl = this.settings[STREAMURL2];
						break;

					case '3':
						streamUrl = this.settings[STREAMURL3];
						break;

					case '4':
						streamUrl = this.settings[STREAMURL4];
						break;

					default:
						streamUrl = DEFAULTSTREAMURL;
						break;
				}
			}

			const latitude = this.settings[LOC1LAT] || DEFAULTLATITUDE;
			const longitude = this.settings[LOC1LON] || DEFAULTLONGITUDE;
			this.location1 = this.settings[LOC1ID] || DEFAULTLOCATION;
			this.location2 = this.settings[LOC2ID];
			this.latitude2 = this.settings[LOC2LAT];
			this.longitude2 = this.settings[LOC2LON];
			this.location3 = this.settings[LOC3ID];
			this.latitude3 = this.settings[LOC3LAT];
			this.longitude3 = this.settings[LOC3LON];
			this.location4 = this.settings[LOC4ID];
			this.latitude4 = this.settings[LOC4LAT];
			this.longitude4 = this.settings[LOC4LON];
			this.CECAddress = this.settings[HDMICEC];

			if (streamUrl !== this.streamUrl) {
				this.streamUrl = streamUrl || DEFAULTSTREAMURL;
				const playerState = this.player.state;
				if (playerState === 'playing') {
					this.stopStream(false);
				}
				this.player.stop();
				this.player.removeEventListener('error', null);
				this.player.removeEventListener('codecupdate', null);
				this.player.removeEventListener('metadata', null);
				this.player.removeEventListener('streamstart', null);
				this.startPlayer();
				if (playerState === 'playing') {
					this.startStream(false);
				}
			}

			if (latitude !== this.latitude1 || longitude !== this.longitude1) {
				this.latitude1 = latitude;
				this.longitude1 = longitude;
				this.setTemperature1();
			}
		}

		this.setState({ showSettings: false });
	};

	private closeAlarmSettings = () => {
		const store = new Store();
		const alarmSettings = store.get(ALARMSTORAGE) as string;
		if (alarmSettings) {
			this.alarmSettings = JSON.parse(alarmSettings);
			const alarmTime = this.alarmSettings[ALARMTIME] || DEFAULTALARMTIME;
			const alarmVolume = this.alarmSettings[ALARMVOLUME] || DEFAULTALARMVOLUME;

			if (alarmTime !== this.alarmTime) {
				this.alarmTime = alarmTime;
				this.setState({ alarmTime: alarmTime });
			}
			if (alarmVolume !== this.alarmVolume) {
				this.alarmVolume = alarmVolume;
			}
		}

		this.setState({ showAlarmSettings: false });
	};

	private closeScreenSaver = () => {
		document?.exitFullscreen().catch(() => null);
		this.setState({ isScreensaver: false });
	};

	public render(): JSX.Element | null {
		let settingsDialog;
		if (this.state.showSettings) {
			settingsDialog = <Settings closeSettings={this.closeSettings} />;
		}

		let alarmDialog;
		if (this.state.showAlarmSettings) {
			alarmDialog = <AlarmSettings closeAlarmSettings={this.closeAlarmSettings} />;
		}

		const screensaverCheckbox = this.state.checkedScreensaver ? checkboxChecked : checkboxUnchecked;
		const alarmCheckbox = this.state.checkedAlarm ? checkboxChecked : checkboxUnchecked;

		let displayView;
		if (this.state.isScreensaver) {
			const numLocations = 1;
			const fontSizeTime = this.screensaverWidth / 16;
			const fontSizeTemp = this.screensaverWidth / 58;
			const fontSizeSong = this.screensaverWidth / 58;
			const padding = this.screensaverWidth / 200;
			const paddingRight = this.screensaverWidth / 130;

			const maxBottom = 1.6 * (fontSizeTime + numLocations * fontSizeTemp);
			const maxRight = 2.6 * fontSizeTime;

			if (this.timeOfDay === '' || this.timeOfDay !== this.state.timeOfDay || this.top < 0 || this.left < 0) {
				this.top = Math.random() * (this.screensaverHeight - 2 * streamTitleHeight - 4 * MARGIN - maxBottom);
				this.left = Math.random() * (this.screensaverWidth - 2 * MARGIN - maxRight);
				this.timeOfDay = this.state.timeOfDay;
			}

			let timeView;
			if (this.screensaverHeight && this.screensaverWidth) {
				let location2;
				let temperature2;
				if (this.location2) {
					location2 = (
						<Text
							selectable={false}
							style={[styles.locationScreensaver, { fontSize: fontSizeTemp, paddingRight: paddingRight }]}
						>
							{this.location2.substring(0, 3).toUpperCase()}
						</Text>
					);
					temperature2 = (
						<Text selectable={false} style={[styles.temperatureScreensaver, { fontSize: fontSizeTemp }]}>
							{this.temperature2}
						</Text>
					);
				}
				let location3;
				let temperature3;
				if (this.location3) {
					location3 = (
						<Text
							selectable={false}
							style={[styles.locationScreensaver, { fontSize: fontSizeTemp, paddingRight: paddingRight }]}
						>
							{this.location3.substring(0, 3).toUpperCase()}
						</Text>
					);
					temperature3 = (
						<Text selectable={false} style={[styles.temperatureScreensaver, { fontSize: fontSizeTemp }]}>
							{this.temperature3}
						</Text>
					);
				}
				let location4;
				let temperature4;
				if (this.location4) {
					location4 = (
						<Text
							selectable={false}
							style={[styles.locationScreensaver, { fontSize: fontSizeTemp, paddingRight: paddingRight }]}
						>
							{this.location4.substring(0, 3).toUpperCase()}
						</Text>
					);
					temperature4 = (
						<Text selectable={false} style={[styles.temperatureScreensaver, { fontSize: fontSizeTemp }]}>
							{this.temperature4}
						</Text>
					);
				}
				timeView = (
					<View style={styles.timeView}>
						<View style={{ position: 'absolute', top: this.top, left: this.left }}>
							<Text selectable={false} style={[styles.timeOfDayScreensaver, { fontSize: fontSizeTime }]}>
								{this.state.timeOfDay}
							</Text>
							<View style={[styles.temperatureContainer, { padding: padding }]}>
								<View style={{ flexDirection: 'row' }}>
									<View>
										<Text
											selectable={false}
											style={[
												styles.locationScreensaver,
												{ fontSize: fontSizeTemp, paddingRight: paddingRight },
											]}
										>
											{this.location1?.substring(0, 3).toUpperCase() || DEFAULTLOCATION}
										</Text>
										{location3}
									</View>
									<View>
										<Text
											selectable={false}
											style={[styles.temperatureScreensaver, { fontSize: fontSizeTemp }]}
										>
											{this.state.temperature ? this.state.temperature : ''}
										</Text>
										{temperature3}
									</View>
								</View>
								<View style={{ flexDirection: 'row' }}>
									<View>
										{location2}
										{location4}
									</View>
									<View>
										{temperature2}
										{temperature4}
									</View>
								</View>
							</View>
						</View>
					</View>
				);
			}

			displayView = (
				<View style={styles.containerScreensaver}>
					<View style={styles.streamTitleScreensaver}>
						<Text numberOfLines={1} style={[styles.streamTitleTextScreensaver, { fontSize: fontSizeSong }]}>
							{this.state.streamTitlePos === TOP ? this.state.streamTitle : ''}
						</Text>
					</View>
					{timeView}
					<View style={styles.streamTitleScreensaver}>
						<Text numberOfLines={1} style={[styles.streamTitleTextScreensaver, { fontSize: fontSizeSong }]}>
							{this.state.streamTitlePos === BOTTOM ? this.state.streamTitle : ''}
						</Text>
					</View>
				</View>
			);
		} else {
			displayView = (
				<View style={styles.containerApp}>
					<Text style={styles.stationInfo}>{this.state.stationInfo}</Text>
					<View style={styles.streamTitle}>
						<Text style={styles.streamTitleText}>{this.state.streamTitle || MUSICOFF}</Text>
					</View>
					<View style={styles.buttonContainer}>
						<Pressable
							style={[
								styles.mediaButton,
								{
									opacity: this.state.pressed === PLAY ? OPACITYPRESSED : undefined,
								},
							]}
							onPressIn={() => this.startStream(false)}
						>
							{playIcon}
						</Pressable>
						<Pressable
							style={[
								styles.mediaButton,
								{
									opacity: this.state.pressed === STOP ? OPACITYPRESSED : undefined,
								},
							]}
							onPressIn={() => this.stopStream(false)}
						>
							{stopIcon}
						</Pressable>
					</View>
					<Text selectable={false} style={styles.timeOfDay}>
						{this.state.timeOfDay}
					</Text>
					<View style={styles.screensaver}>
						<Pressable
							style={{
								opacity: this.state.pressed === SCREENSAVER ? OPACITYPRESSED : undefined,
							}}
							onPressIn={this.onPressScreensaver}
						>
							{screensaverIcon}
						</Pressable>
						<Text selectable={false} style={styles.alarmText}>
							Auto
						</Text>
						<Pressable onPressIn={this.onChangeScreensaverCheckbox}>{screensaverCheckbox}</Pressable>
					</View>
					<View style={styles.settings}>
						<Pressable
							style={{
								opacity: this.state.pressed === SETTINGS ? OPACITYPRESSED : undefined,
							}}
							onPressIn={this.onPressSettings}
						>
							{settingsIcon}
						</Pressable>
					</View>
					<View style={styles.alarm}>
						<Pressable
							style={{
								opacity: this.state.pressed === ALARM ? OPACITYPRESSED : undefined,
							}}
							onPressIn={this.onPressAlarm}
						>
							{alarmIcon}
						</Pressable>
						<Text selectable={false} style={styles.alarmText}>
							{this.state.alarmTime}
						</Text>
						<Pressable onPressIn={this.onChangeAlarmCheckbox}>{alarmCheckbox}</Pressable>
					</View>
					<View style={[styles.alarmBar, { width: this.state.volume * alarmWidth }]} />
					<Text selectable={false} style={styles.temperature}>
						{this.state.temperature && Number(this.state.temperature) ? this.state.temperature + ' °C' : ''}
					</Text>
					{settingsDialog}
					{alarmDialog}
				</View>
			);
		}

		return (
			<View style={styles.container} id={'fullscreenview'}>
				{displayView}
			</View>
		);
	}
}
