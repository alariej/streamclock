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

const mainFontSize = 24;
const alarmWidth = 140;
const margin = 24;
const fontColor = 'white';
const opacityPressed = 0.2;

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'center',
		backgroundColor: 'steelblue',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		margin: margin,
	},
	mediaButton: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 64,
		width: 64,
		borderRadius: 32,
		marginHorizontal: margin / 2,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	streamTitle: {
		height: 76,
		margin: margin,
		alignContent: 'center',
		justifyContent: 'center',
	},
	streamTitleText: {
		fontSize: 36,
		textAlign: 'center',
		color: fontColor,
	},
	temperature: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		fontSize: mainFontSize,
		color: fontColor,
		margin: margin,
	},
	timeOfDay: {
		fontSize: 72,
		fontWeight: 'bold',
		textAlign: 'center',
		color: fontColor,
		margin: margin,
	},
	stationInfo: {
		height: mainFontSize,
		fontSize: mainFontSize,
		textAlign: 'center',
		color: fontColor,
		opacity: 0.67,
		margin: margin,
	},
	settings: {
		position: 'absolute',
		top: 0,
		right: 0,
		margin: margin,
	},
	alarm: {
		position: 'absolute',
		flexDirection: 'row',
		justifyContent: 'space-between',
		bottom: 0,
		left: 0,
		margin: margin,
		width: alarmWidth,
	},
	alarmText: {
		fontSize: mainFontSize,
		color: fontColor,
	},
	screensaver: {
		position: 'absolute',
		top: 0,
		left: 0,
		margin: margin,
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: 70,
	},
	alarmBar: {
		position: 'absolute',
		left: 0,
		bottom: 0,
		marginLeft: margin,
		marginBottom: margin - 2,
		height: 2,
		backgroundColor: fontColor,
		opacity: 0.67,
	},
});

const src = 'https://radio4.cdm-radio.com:18020/stream-mp3-Chill';

const alarmTime = '06:30';
const alarmDuration = 20;
const latitude = 47.3492;
const longitude = 8.5654;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppProps {}

interface AppState {
	temperature: number | undefined;
	pressed: string;
	streamTitle: string;
	stationInfo: string;
	timeOfDay: string;
	checkedAlarm: boolean;
	checkedScreensaver: boolean;
	volume: number;
}

export default class App extends Component<AppProps, AppState> {
	private intervalMain: NodeJS.Timer | undefined;
	private player!: IcecastMetadataPlayer;
	private withFadeIn = false;
	private stoppingAlarm = false;

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
		};
	}

	public async componentDidMount(): Promise<void> {
		// here we will need to read all the data from local storage and set the
		// values to the state variables
		// streamUrl
		// alarm on/off (checked)
		// latitude / longitude
		// alarm time
		// alarm duration
		// alarm volume
		// screensaver on/off

		this.setState({ checkedAlarm: true });
		this.setState({ checkedScreensaver: true });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onCodecUpdate = async (codecInfo: any) => {
			if (!this.state.stationInfo) {
				let host = '';
				let location = '';
				await fetch('https://radio4.cdm-radio.com:18020/status-json.xsl')
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

		const onError = (message: string) => {
			this.setState({ streamTitle: message.toString() });
		};

		this.player = new IcecastMetadataPlayer(src, {
			onMetadata: (metadata: IcyMetadata) => {
				if (!this.stoppingAlarm) {
					this.setState({ streamTitle: metadata.StreamTitle || '( No metadata available )' });
				}
			},
			onStreamStart: () => {
				if (this.withFadeIn) {
					this.fadeIn();
				}
			},
			onStop: () => {
				this.stopStream(false);
			},
			onCodecUpdate: onCodecUpdate,
			onError: onError,
			metadataTypes: ['icy'],
		});

		// doesn't work
		// this.player.addEventListener('codecupdate', onCodecUpdate, { once: true });

		const stopAlarmTimeout = () => {
			setTimeout(() => {
				if (this.player.state !== 'stopped') {
					this.setState({ streamTitle: '( Stopping alarm... )' });
					this.stoppingAlarm = true;
					this.stopStream(true);
				}
			}, alarmDuration * 60 * 1000);
		};

		// needs some additional logic for:
		// alarm triggered
		// alarm cancelled
		// for volumes and loops to be consitents

		const setTemperature = async () => {
			const response = await fetch(
				'https://api.open-meteo.com/v1/forecast?latitude=' +
					latitude +
					'&longitude=' +
					longitude +
					'&current_weather=true&forecast_days=1'
			);

			if (response.status === 200) {
				const weatherInfo = await response.json();
				const temperature = weatherInfo.current_weather.temperature;
				this.setState({ temperature: temperature });
			}
		};

		setTemperature();

		const getTimeOfDay = (date: Date): string => {
			const timeOfDay = date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: 'numeric',
				hour12: false,
			});

			this.setState({ timeOfDay: timeOfDay });

			return timeOfDay;
		};

		const date = new Date();
		getTimeOfDay(date);

		this.intervalMain = setInterval(() => {
			const date = new Date();
			const timeOfDay = getTimeOfDay(date);

			if (this.player.state !== 'playing' && alarmTime === timeOfDay) {
				this.setState({ streamTitle: '( Starting alarm... )' });
				this.startStream(true);
				stopAlarmTimeout();
			}

			if ([0, 15, 30, 45].includes(date.getMinutes())) {
				setTemperature();
			}
		}, 15 * 1000);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onClick = (e: any) => {
			console.log(e);
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
		this.player.removeEventListener('stop', null);
	}

	private startStream = (withFadeIn: boolean) => {
		this.setState({ pressed: 'PLAY', streamTitle: '( Starting stream... )' });
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
		this.setState({ pressed: 'STOP', streamTitle: '( Stopping stream... )' });
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

	private onPressScreensaver = () => {
		this.setState({ pressed: 'SCREENSAVER' });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private onPressSettings = () => {
		this.setState({ pressed: 'SETTINGS' });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private onPressAlarm = () => {
		this.setState({ pressed: 'ALARM' });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private onChangeScreensaverCheckbox = () => {
		this.setState({ checkedScreensaver: !this.state.checkedScreensaver });
	};

	private onChangeAlarmCheckbox = () => {
		this.setState({ checkedAlarm: !this.state.checkedAlarm });
	};

	public render(): JSX.Element | null {
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
								opacity: this.state.pressed === 'PLAY' ? opacityPressed : undefined,
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
								opacity: this.state.pressed === 'STOP' ? opacityPressed : undefined,
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
							opacity: this.state.pressed === 'SCREENSAVER' ? opacityPressed : undefined,
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
							opacity: this.state.pressed === 'SETTINGS' ? opacityPressed : undefined,
						}}
						onPressIn={this.onPressSettings}
					>
						{settingsIcon}
					</Pressable>
				</View>
				<View style={styles.alarm}>
					<Pressable
						style={{
							opacity: this.state.pressed === 'ALARM' ? opacityPressed : undefined,
						}}
						onPressIn={this.onPressAlarm}
					>
						{alarmIcon}
					</Pressable>
					<Text selectable={false} style={styles.alarmText}>
						{alarmTime}
					</Text>
					<Pressable onPressIn={this.onChangeAlarmCheckbox}>{alarmCheckbox}</Pressable>
				</View>
				<View style={[styles.alarmBar, { width: this.state.volume * alarmWidth }]} />
				<Text selectable={false} style={styles.temperature}>
					{this.state.temperature ? this.state.temperature + ' °C' : ''}
				</Text>
			</SafeAreaView>
		);
	}
}
