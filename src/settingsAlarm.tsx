import { Component } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
	APPCOLOR,
	BUTTONCOLOR,
	CLOSE,
	FONTCOLOR,
	MARGIN,
	MODALBACKGROUNDCOLOR,
	OPACITYPRESSED,
	SAVE,
	ALARMSTORAGE,
	SettingsData,
	TEXTINPUTBACKGROUNDCOLOR,
	TEXTINPUTFONTCOLOR,
	ALARMTIME,
	DEFAULTALARMTIME,
	ALARMVOLUME,
	DEFAULTALARMVOLUME,
	FONTFAMILY,
} from './uiconfig';
import Store from 'electron-store';

const fontSize = 16;
const gridMargin = 4;
const textPadding = 4;

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: MODALBACKGROUNDCOLOR,
	},
	containerSettings: {
		backgroundColor: APPCOLOR,
		padding: MARGIN,
	},
	settingsRow: {
		flexDirection: 'row',
		marginVertical: gridMargin / 2,
	},
	label: {
		fontFamily: FONTFAMILY,
		fontSize: fontSize,
		color: FONTCOLOR,
		width: 160,
		textAlign: 'right',
		marginRight: 8,
		padding: 4,
	},
	alarmInput: {
		flex: 1,
		fontFamily: FONTFAMILY,
		fontSize: 16,
		color: TEXTINPUTFONTCOLOR,
		padding: textPadding,
		backgroundColor: TEXTINPUTBACKGROUNDCOLOR,
		marginRight: MARGIN,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: MARGIN,
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 36,
		width: 140,
		borderRadius: 36 / 2,
		marginHorizontal: MARGIN,
		backgroundColor: BUTTONCOLOR,
	},
	buttonText: {
		fontFamily: FONTFAMILY,
		fontSize: fontSize,
		color: FONTCOLOR,
	},
});

interface AlarmSettingsProps {
	closeAlarmSettings: () => void;
}

interface AlarmSettingsState {
	alarmSettings: SettingsData;
	pressed: string;
}

export default class AlarmSettings extends Component<AlarmSettingsProps, AlarmSettingsState> {
	private alarmSettings: SettingsData = {};

	constructor(props: AlarmSettingsProps) {
		super(props);
		this.state = {
			alarmSettings: {},
			pressed: '',
		};
	}

	public componentDidMount(): void {
		const store = new Store();
		const settings = store.get(ALARMSTORAGE) as string;
		if (settings) {
			this.alarmSettings = JSON.parse(settings);
			this.setState({ alarmSettings: this.alarmSettings });
		}
	}

	private onChangeText = (textInput: string, text: string) => {
		this.alarmSettings[textInput] = text;
	};

	private onSave = () => {
		if (this.alarmSettings[ALARMTIME].indexOf(':') === -1) {
			this.alarmSettings[ALARMTIME] =
				this.alarmSettings[ALARMTIME].slice(-4, -2) + ':' + this.alarmSettings[ALARMTIME].slice(-2);
		}
		if (this.alarmSettings[ALARMTIME].length === 4) {
			this.alarmSettings[ALARMTIME] = '0' + this.alarmSettings[ALARMTIME];
		}
		const store = new Store();
		store.set(ALARMSTORAGE, JSON.stringify(this.alarmSettings));
		this.setState({ pressed: SAVE });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private onClose = () => {
		this.props.closeAlarmSettings();
		this.setState({ pressed: CLOSE });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	public render(): JSX.Element | null {
		return (
			<Modal
				animationType={'fade'}
				transparent={true}
				visible={true}
				onRequestClose={this.props.closeAlarmSettings}
			>
				<View style={styles.container}>
					<View style={styles.containerSettings}>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Alarm time</Text>
							<TextInput
								style={styles.alarmInput}
								spellCheck={false}
								autoFocus={true}
								onChangeText={text => this.onChangeText(ALARMTIME, text)}
								key={this.state?.alarmSettings[ALARMTIME] || DEFAULTALARMTIME}
								defaultValue={this.state?.alarmSettings[ALARMTIME] || DEFAULTALARMTIME}
							/>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>System volume (%)</Text>
							<TextInput
								style={styles.alarmInput}
								spellCheck={false}
								autoFocus={true}
								onChangeText={text => this.onChangeText(ALARMVOLUME, text)}
								key={this.state?.alarmSettings[ALARMVOLUME] || DEFAULTALARMVOLUME}
								defaultValue={this.state?.alarmSettings[ALARMVOLUME] || DEFAULTALARMVOLUME}
							/>
						</View>
						<View style={styles.buttonContainer}>
							<Pressable
								style={[
									styles.button,
									{
										opacity: this.state.pressed === SAVE ? OPACITYPRESSED : undefined,
									},
								]}
								onPress={this.onSave}
							>
								<Text style={styles.buttonText}>Save</Text>
							</Pressable>
							<Pressable
								style={[
									styles.button,
									{
										opacity: this.state.pressed === CLOSE ? OPACITYPRESSED : undefined,
									},
								]}
								onPress={this.onClose}
							>
								<Text style={styles.buttonText}>Close</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		);
	}
}
