import { Component } from 'react';
import { StyleSheet, Pressable, Text, SafeAreaView, View } from 'react-native';
import IcecastMetadataPlayer from 'icecast-metadata-player';

const mainFontSize = 24;

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'center',
		backgroundColor: 'lightsteelblue',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		margin: 24,
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 64,
		width: 64,
		borderRadius: 32,
		marginHorizontal: 12,
		backgroundColor: 'steelblue',
	},
	buttonText: {
		fontSize: 24,
		fontFamily: 'sans-serif',
		color: 'white',
		marginBottom: 4,
	},
	streamTitle: {
		height: 76,
		margin: 24,
		alignContent: 'center',
		justifyContent: 'center',
	},
	streamTitleText: {
		fontSize: 32,
		textAlign: 'center',
		color: 'white',
	},
	temperature: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		fontSize: mainFontSize,
		color: 'white',
		margin: 24,
	},
	timeOfDay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		fontSize: mainFontSize,
		color: 'white',
		margin: 24,
	},
	settings: {
		position: 'absolute',
		top: 0,
		right: 0,
		color: 'white',
		margin: 18,
	},
	settingsText: {
		fontSize: 32,
		color: 'white',
	},
	alarm: {
		position: 'absolute',
		flexDirection: 'row',
		top: 0,
		left: 0,
		margin: 24,
	},
	alarmText: {
		fontSize: mainFontSize,
		color: 'white',
	},
	checkbox: {
		height: 20,
		width: 20,
		marginLeft: 12,
	},
});

const src = 'https://radio4.cdm-radio.com:18020/stream-mp3-Chill';
const alarmTime = '06:31';
const alarmDuration = 20;
const latitude = 47.3492;
const longitude = 8.5654;

interface AppProps {}

interface AppState {
	temperature: number | undefined;
	pressed: string;
	streamTitle: string;
	timeOfDay: string;
	checked: boolean;
}

export default class App extends Component<AppProps, AppState> {
	private intervalMain: NodeJS.Timer | undefined;
	private player!: IcecastMetadataPlayer;
	private withFadeIn = false;
	private checkbox!: HTMLInputElement | null;

	constructor(props: AppProps) {
		super(props);
		this.state = { temperature: undefined, pressed: '', streamTitle: '', timeOfDay: '', checked: false };
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

		this.setState({ checked: true });

		let codecInfo: any = undefined;
		const onCodecUpdate = (codecInfo_: any) => {
			if (!codecInfo) {
				codecInfo = codecInfo_;
			}
		};

		const onError = (message: string, error: Error | undefined) => {
			this.setState({ streamTitle: message.toString() });
		};

		this.player = new IcecastMetadataPlayer(src, {
			onMetadata: (metadata: any) => {
				this.setState({ streamTitle: metadata.StreamTitle });
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

		const stopAlarmTimeout = () => {
			setTimeout(() => {
				if (this.player.state !== 'stopped') {
					this.setState({ streamTitle: '( Stopping alarm... )' });
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
		}, 30 * 1000);
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
		this.setState({ pressed: 'PLAY' });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);

		if (withFadeIn) {
			this.withFadeIn = withFadeIn;
		} else {
			this.player.audioElement.volume = 1;
		}

		this.player.play();
	};

	private stopStream = (withFadeOut: boolean) => {
		this.setState({ pressed: 'STOP' });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);

		if (withFadeOut) {
			this.fadeOut();
		} else {
			this.player.stop();
			this.setState({ streamTitle: '' });
		}
	};

	private fadeIn = () => {
		this.player.audioElement.volume = 0;
		const fadeInSeconds = 30;
		const fadeInSteps = 30;
		let i = 0;
		const interval = setInterval(() => {
			i++;
			console.log(i);
			this.player.audioElement.volume = i / fadeInSteps;
			if (i >= fadeInSteps) {
				clearInterval(interval);
			}
		}, (fadeInSeconds * 1000) / fadeInSteps);
	};

	private fadeOut = () => {
		this.player.audioElement.volume = 1;
		const fadeOutSeconds = 15;
		const fadeOutSteps = 30;
		let i = 0;
		const interval = setInterval(() => {
			i++;
			console.log(i);
			this.player.audioElement.volume = (fadeOutSteps - i) / fadeOutSteps;
			if (i >= fadeOutSteps) {
				clearInterval(interval);
				this.player.stop();
				this.setState({ streamTitle: '' });
			}
		}, (fadeOutSeconds * 1000) / fadeOutSteps);
	};

	private onPressSettings = () => {
		this.setState({ pressed: 'SETTINGS' });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private onChangeAlarmCheckbox = () => {
		this.setState({ checked: !this.state.checked });
	};

	public render(): JSX.Element | null {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.streamTitle}>
					<Text style={styles.streamTitleText}>{this.state.streamTitle || '( Music off )'}</Text>
				</View>
				<View style={styles.buttonContainer}>
					<Pressable
						style={[
							styles.button,
							{
								opacity: this.state.pressed === 'PLAY' ? 0.5 : 1,
							},
						]}
						onPressIn={() => this.startStream(false)}
					>
						<Text style={[styles.buttonText, { marginLeft: 4 }]}>{'▶'}</Text>
					</Pressable>
					<Pressable
						style={[
							styles.button,
							{
								opacity: this.state.pressed === 'STOP' ? 0.5 : 1,
							},
						]}
						onPressIn={() => this.stopStream(false)}
					>
						<Text style={styles.buttonText}>{'◼'}</Text>
					</Pressable>
				</View>
				<View style={styles.alarm}>
					<Text style={styles.alarmText}>{'Alarm - ' + alarmTime}</Text>
					<input
						ref={element => (this.checkbox = element)}
						style={styles.checkbox}
						type="checkbox"
						id="checkbox"
						checked={this.state.checked}
						onChange={this.onChangeAlarmCheckbox}
					/>
				</View>
				<Pressable
					style={[
						styles.settings,
						{
							opacity: this.state.pressed === 'SETTINGS' ? 0.5 : 1,
						},
					]}
					onPressIn={this.onPressSettings}
				>
					<Text style={styles.settingsText}>{'⚙️'}</Text>
				</Pressable>
				<Text style={styles.temperature}>{this.state.temperature ? this.state.temperature + ' °C' : ''}</Text>
				<Text style={styles.timeOfDay}>{this.state.timeOfDay}</Text>
			</SafeAreaView>
		);
	}
}
