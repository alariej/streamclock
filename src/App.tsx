import { Component } from 'react';
import { StyleSheet, Pressable, Text, SafeAreaView, View } from 'react-native';
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
	APPCOLOR,
	BUTTONCOLOR,
	DEFAULTALARMDURATION,
	DEFAULTALARMTIME,
	DEFAULTLATITUDE,
	DEFAULTLONGITUDE,
	DEFAULTSTREAMURL,
	FONTCOLOR,
	FONTSIZE,
	LOC1LAT,
	LOC1LON,
	MARGIN,
	OFF,
	ON,
	OPACITYPRESSED,
	PLAY,
	SCREENSAVER,
	SCREENSAVERONOFF,
	SETTINGS,
	SETTINGSSTORAGE,
	STOP,
	STREAMURL,
	SettingsData,
} from './uiconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlarmSettings from './alarmSettings';

const alarmWidth = 140;

const styles = StyleSheet.create({
	container: {
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
		fontSize: 36,
		textAlign: 'center',
		color: FONTCOLOR,
	},
	temperature: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		fontSize: FONTSIZE,
		color: FONTCOLOR,
		margin: MARGIN,
	},
	timeOfDay: {
		fontSize: 104,
		fontWeight: 'bold',
		textAlign: 'center',
		color: FONTCOLOR,
		margin: MARGIN,
	},
	stationInfo: {
		height: FONTSIZE,
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
		flexDirection: 'row',
		justifyContent: 'space-between',
		bottom: 0,
		left: 0,
		margin: MARGIN,
		width: alarmWidth,
	},
	alarmText: {
		fontSize: FONTSIZE,
		color: FONTCOLOR,
	},
	screensaver: {
		position: 'absolute',
		top: 0,
		left: 0,
		margin: MARGIN,
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: 70,
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
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppProps {}

interface AppState {
	temperature: number | undefined;
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
}

export default class App extends Component<AppProps, AppState> {
	private intervalMain: NodeJS.Timer | undefined;
	private player!: IcecastMetadataPlayer;
	private withFadeIn = false;
	private stoppingAlarm = false;
	private streamUrl = '';
	private latitude = '';
	private longitude = '';
	private alarmTime = '';
	private alarmDuration = DEFAULTALARMDURATION;
	private settings: SettingsData = {};
	private alarmSettings: SettingsData = {};

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
		};
	}

	public async componentDidMount(): Promise<void> {
		await AsyncStorage.getItem(SETTINGSSTORAGE)
			.then(settings => {
				if (settings) {
					this.settings = JSON.parse(settings);
					this.streamUrl = this.settings[STREAMURL] || DEFAULTSTREAMURL;
					this.latitude = this.settings[LOC1LAT] || DEFAULTLATITUDE;
					this.longitude = this.settings[LOC1LON] || DEFAULTLONGITUDE;
				} else {
					this.streamUrl = DEFAULTSTREAMURL;
					this.latitude = DEFAULTLATITUDE;
					this.longitude = DEFAULTLONGITUDE;
				}
			})
			.catch();

		await AsyncStorage.getItem(ALARMSTORAGE)
			.then(alarmSettings => {
				if (alarmSettings) {
					this.alarmSettings = JSON.parse(alarmSettings);
					this.alarmTime = this.alarmSettings[ALARMTIME] || DEFAULTALARMTIME;
				} else {
					this.alarmTime = DEFAULTALARMTIME;
				}
			})
			.catch();

		this.setState({ alarmTime: this.alarmTime });

		let checkedAlarm = true;
		await AsyncStorage.getItem(ALARMONOFF)
			.then(alarmOnOff => {
				if (alarmOnOff) {
					checkedAlarm = alarmOnOff === ON;
				} else {
					checkedAlarm = true;
				}
			})
			.catch();

		this.setState({ checkedAlarm: checkedAlarm });

		let checkedScreensaver = true;
		await AsyncStorage.getItem(SCREENSAVERONOFF)
			.then(screensaverOnOff => {
				if (screensaverOnOff) {
					checkedScreensaver = screensaverOnOff === ON;
				} else {
					checkedScreensaver = true;
				}
			})
			.catch();

		this.setState({ checkedScreensaver: checkedScreensaver });

		this.startPlayer();

		// doesn't work
		// this.player.addEventListener('codecupdate', onCodecUpdate, { once: true });

		this.setTemperature();

		const date = new Date();
		this.getTimeOfDay(date);

		this.intervalMain = setInterval(() => {
			const date = new Date();
			const timeOfDay = this.getTimeOfDay(date);

			if (this.player.state !== 'playing' && this.alarmTime === timeOfDay) {
				this.setState({ streamTitle: '( Starting alarm... )' });
				this.startStream(true);
				this.stopAlarmTimeout();
			}

			if ([0, 15, 30, 45].includes(date.getMinutes())) {
				this.setTemperature();
			}
		}, 15 * 1000);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onClick = (e: any) => {
			// console.log(e);
		};
		window.addEventListener('click', onClick, true);
		window.addEventListener('keypress', onClick, true);
	}

	public componentWillUnmount(): void {
		clearInterval(this.intervalMain);
		this.player.stop();
		this.player.removeEventListener('error', null);
		this.player.removeEventListener('codecupdate', null);
		this.player.removeEventListener('metadata', null);
		this.player.removeEventListener('streamstart', null);
	}

	private startPlayer = () => {
		this.player = new IcecastMetadataPlayer(this.streamUrl, {
			onMetadata: this.onMetadata,
			onStreamStart: this.onStreamStart,
			onCodecUpdate: this.onCodecUpdate,
			onError: this.onError,
			metadataTypes: ['icy'],
		});
	};

	private onMetadata = (metadata: IcyMetadata) => {
		if (!this.stoppingAlarm) {
			this.setState({ streamTitle: metadata.StreamTitle || '( No metadata available )' });
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
		const urlMatch = this.streamUrl.match(/.*\//);
		const baseUrl = urlMatch?.length ? urlMatch[0] : '';
		return baseUrl ? baseUrl + 'status-json.xsl' : '';
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private onCodecUpdate = async (codecInfo: any) => {
		if (!this.state.stationInfo) {
			const statsUrl = this.getStatsUrl();
			if (!statsUrl) {
				this.setState({ stationInfo: '   ' });
				return;
			}

			let host = '';
			let location = '';
			await fetch(statsUrl)
				.then(async response => {
					const stats = await response.json();
					host = stats.icestats.host;
					location = stats.icestats.location;
				})
				.catch();

			this.setState({
				stationInfo:
					(host || '( No host )') +
					'  ⋯  ' +
					(location || '( Planet Earth )') +
					'  ⋯  ' +
					codecInfo.bitrate.toString() +
					' bps, ' +
					codecInfo.sampleRate.toString() +
					' Hz',
			});
		}
	};

	private startStream = (withFadeIn: boolean) => {
		this.setState({ pressed: PLAY, streamTitle: '( Starting stream... )' });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);

		if (withFadeIn) {
			this.withFadeIn = true;
		} else {
			this.player.audioElement.volume = 1;
		}

		this.player.play();
	};

	private stopStream = (withFadeOut: boolean) => {
		this.setState({ pressed: STOP, streamTitle: '( Stopping stream... )' });
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

	private setTemperature = async () => {
		const response = await fetch(
			'https://api.open-meteo.com/v1/forecast?latitude=' +
				this.latitude +
				'&longitude=' +
				this.longitude +
				'&current_weather=true&forecast_days=1'
		);

		if (response.status === 200) {
			const weatherInfo = await response.json();
			const temperature = weatherInfo.current_weather.temperature;
			this.setState({ temperature: temperature });
		}
	};

	private getTimeOfDay = (date: Date): string => {
		const timeOfDay = date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: false,
		});

		this.setState({ timeOfDay: timeOfDay });

		return timeOfDay;
	};

	private stopAlarmTimeout = () => {
		setTimeout(() => {
			if (this.player.state !== 'stopped') {
				this.setState({ streamTitle: '( Stopping alarm... )' });
				this.stoppingAlarm = true;
				this.stopStream(true);
			}
		}, this.alarmDuration * 60 * 1000);
	};

	private onPressScreensaver = () => {
		this.setState({ pressed: SCREENSAVER });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
		// launch screensaver
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

	private onChangeScreensaverCheckbox = () => {
		const screensaverOnOff = this.state.checkedScreensaver ? OFF : ON;
		AsyncStorage.setItem(SCREENSAVERONOFF, screensaverOnOff);
		this.setState({ checkedScreensaver: !this.state.checkedScreensaver });
	};

	private onChangeAlarmCheckbox = () => {
		const alarmOnOff = this.state.checkedAlarm ? OFF : ON;
		AsyncStorage.setItem(ALARMONOFF, alarmOnOff);
		this.setState({ checkedAlarm: !this.state.checkedAlarm });
	};

	private closeSettings = async () => {
		await AsyncStorage.getItem(SETTINGSSTORAGE)
			.then(settings => {
				if (settings) {
					this.settings = JSON.parse(settings);
					const streamUrl = this.settings[STREAMURL] || DEFAULTSTREAMURL;
					const latitude = this.settings[LOC1LAT] || DEFAULTLATITUDE;
					const longitude = this.settings[LOC1LON] || DEFAULTLONGITUDE;

					if (streamUrl !== this.streamUrl) {
						this.streamUrl = streamUrl;
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

					if (latitude !== this.latitude || longitude !== this.longitude) {
						this.latitude = latitude;
						this.longitude = longitude;
						this.setTemperature();
					}
				}
			})
			.catch();

		this.setState({ showSettings: false });
	};

	private closeAlarmSettings = async () => {
		await AsyncStorage.getItem(ALARMSTORAGE)
			.then(alarmSettings => {
				if (alarmSettings) {
					this.alarmSettings = JSON.parse(alarmSettings);
					const alarmTime = this.alarmSettings[ALARMTIME] || DEFAULTALARMTIME;

					if (alarmTime !== this.alarmTime) {
						this.alarmTime = alarmTime;
						this.setState({ alarmTime: alarmTime });
					}
				}
			})
			.catch();

		this.setState({ showAlarmSettings: false });
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

		return (
			<SafeAreaView style={styles.container}>
				<Text style={styles.stationInfo}>{this.state.stationInfo}</Text>
				<View style={styles.streamTitle}>
					<Text style={styles.streamTitleText}>{this.state.streamTitle || '( Music off )'}</Text>
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
					{this.state.temperature ? this.state.temperature + ' °C' : ''}
				</Text>
				{settingsDialog}
				{alarmDialog}
			</SafeAreaView>
		);
	}
}
