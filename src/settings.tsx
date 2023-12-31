import { Component } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
	APPCOLOR,
	BUTTONCOLOR,
	CHECKEDURL,
	CLOSE,
	DEFAULTLATITUDE,
	DEFAULTLOCATION,
	DEFAULTLONGITUDE,
	DEFAULTSTREAMURL,
	FONTCOLOR,
	FONTFAMILY,
	HDMICEC,
	HDMICECPLACEHOLDER,
	LATITUDEPLACEHOLDER,
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
	LOCATIONIDPLACEHOLDER,
	LONGITUDEPLACEHOLDER,
	MARGIN,
	MODALBACKGROUNDCOLOR,
	OPACITYPRESSED,
	PLACEHOLDERCOLOR,
	SAVE,
	SETTINGSSTORAGE,
	STREAMURL,
	STREAMURL2,
	STREAMURL3,
	STREAMURL4,
	SettingsData,
	TEXTINPUTBACKGROUNDCOLOR,
	TEXTINPUTFONTCOLOR,
} from './uiconfig';
import Store from 'electron-store';
import packageJson from '../package.json';

const fontSize = 16;
const width = 560;
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
		width: 120,
		textAlign: 'right',
		marginRight: 8,
		paddingVertical: 4,
	},
	title: {
		flex: 1,
		fontFamily: FONTFAMILY,
		fontSize: fontSize,
		fontWeight: 'bold',
		color: FONTCOLOR,
		textAlign: 'center',
		marginBottom: MARGIN,
	},
	urlInput: {
		width: width,
		height: 30,
		fontFamily: FONTFAMILY,
		fontSize: 16,
		color: TEXTINPUTFONTCOLOR,
		padding: textPadding,
		backgroundColor: TEXTINPUTBACKGROUNDCOLOR,
	},
	locationInput: {
		width: (width - 2 * gridMargin) / 3,
		height: 30,
		fontFamily: FONTFAMILY,
		fontSize: fontSize,
		color: TEXTINPUTFONTCOLOR,
		padding: textPadding,
		backgroundColor: TEXTINPUTBACKGROUNDCOLOR,
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
	radioButtonUnchecked: {
		width: 18,
		height: 18,
		borderRadius: 9,
		margin: (30 - 18) / 2,
		backgroundColor: TEXTINPUTBACKGROUNDCOLOR,
	},
	radioButtonChecked: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 6,
		borderColor: TEXTINPUTBACKGROUNDCOLOR,
		margin: (30 - 18) / 2,
		backgroundColor: 'black',
	},
});

interface SettingsProps {
	closeSettings: () => void;
}

interface SettingsState {
	settings: SettingsData;
	pressed: string;
}

export default class Settings extends Component<SettingsProps, SettingsState> {
	private settings: SettingsData = {};

	constructor(props: SettingsProps) {
		super(props);
		this.state = {
			settings: {},
			pressed: '',
		};
	}

	public componentDidMount(): void {
		const store = new Store();
		const settings = store.get(SETTINGSSTORAGE) as string;
		if (settings) {
			this.settings = JSON.parse(settings);
			this.setState({ settings: this.settings });
		}
	}

	private onChangeText = (textInput: string, text: string) => {
		this.settings[textInput] = text;
	};

	private onSave = () => {
		const store = new Store();
		store.set(SETTINGSSTORAGE, JSON.stringify(this.settings));
		this.setState({ pressed: SAVE });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private onClose = () => {
		this.props.closeSettings();
		this.setState({ pressed: CLOSE });
		setTimeout(() => {
			this.setState({ pressed: '' });
		}, 250);
	};

	private onChangeUrlCheckbox = (n: string) => {
		this.settings[CHECKEDURL] = n;
		this.setState({ settings: this.settings });
	};

	public render(): JSX.Element | null {
		const radioUnchecked = <View style={styles.radioButtonUnchecked} />;
		const radioChecked = <View style={styles.radioButtonChecked} />;

		const urlCheckbox1 =
			!this.state?.settings[CHECKEDURL] || this.state?.settings[CHECKEDURL] === '1'
				? radioChecked
				: radioUnchecked;
		const urlCheckbox2 = this.state?.settings[CHECKEDURL] === '2' ? radioChecked : radioUnchecked;
		const urlCheckbox3 = this.state?.settings[CHECKEDURL] === '3' ? radioChecked : radioUnchecked;
		const urlCheckbox4 = this.state?.settings[CHECKEDURL] === '4' ? radioChecked : radioUnchecked;

		return (
			<Modal animationType={'fade'} transparent={true} visible={true} onRequestClose={this.props.closeSettings}>
				<View style={styles.container}>
					<View style={styles.containerSettings}>
						<View style={styles.settingsRow}>
							<Text style={styles.title}>{packageJson.displayName + '   v' + packageJson.version}</Text>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Stream URL 1</Text>
							<TextInput
								style={styles.urlInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(STREAMURL, text)}
								key={this.state?.settings[STREAMURL] || DEFAULTSTREAMURL}
								defaultValue={this.state?.settings[STREAMURL] || DEFAULTSTREAMURL}
							/>
							<Pressable
								onPressIn={() => {
									this.onChangeUrlCheckbox('1');
								}}
							>
								{urlCheckbox1}
							</Pressable>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Stream URL 2</Text>
							<TextInput
								style={styles.urlInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(STREAMURL2, text)}
								key={this.state?.settings[STREAMURL2]}
								defaultValue={this.state?.settings[STREAMURL2]}
							/>
							<Pressable
								onPressIn={() => {
									this.onChangeUrlCheckbox('2');
								}}
							>
								{urlCheckbox2}
							</Pressable>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Stream URL 3</Text>
							<TextInput
								style={styles.urlInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(STREAMURL3, text)}
								key={this.state?.settings[STREAMURL3]}
								defaultValue={this.state?.settings[STREAMURL3]}
							/>
							<Pressable
								onPressIn={() => {
									this.onChangeUrlCheckbox('3');
								}}
							>
								{urlCheckbox3}
							</Pressable>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Stream URL 4</Text>
							<TextInput
								style={styles.urlInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(STREAMURL4, text)}
								key={this.state?.settings[STREAMURL4]}
								defaultValue={this.state?.settings[STREAMURL4]}
							/>
							<Pressable
								onPressIn={() => {
									this.onChangeUrlCheckbox('4');
								}}
							>
								{urlCheckbox4}
							</Pressable>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Location 1</Text>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC1ID, text)}
								key={this.state?.settings[LOC1ID] || LOC1ID}
								defaultValue={this.state?.settings[LOC1ID] || DEFAULTLOCATION}
								placeholder={LOCATIONIDPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
							<TextInput
								style={[styles.locationInput, { marginHorizontal: gridMargin }]}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC1LAT, text)}
								key={this.state?.settings[LOC1LAT] || LOC1LAT}
								defaultValue={this.state?.settings[LOC1LAT] || DEFAULTLATITUDE}
								placeholder={LATITUDEPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC1LON, text)}
								key={this.state?.settings[LOC1LON] || LOC1LON}
								defaultValue={this.state?.settings[LOC1LON] || DEFAULTLONGITUDE}
								placeholder={LONGITUDEPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Location 2</Text>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC2ID, text)}
								key={this.state?.settings[LOC2ID] || LOC2ID}
								defaultValue={this.state?.settings[LOC2ID]}
								placeholder={LOCATIONIDPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
							<TextInput
								style={[styles.locationInput, { marginHorizontal: gridMargin }]}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC2LAT, text)}
								key={this.state?.settings[LOC2LAT] || LOC2LAT}
								defaultValue={this.state?.settings[LOC2LAT]}
								placeholder={LATITUDEPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC2LON, text)}
								key={this.state?.settings[LOC2LON] || LOC2LON}
								defaultValue={this.state?.settings[LOC2LON]}
								placeholder={LONGITUDEPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Location 3</Text>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC3ID, text)}
								key={this.state?.settings[LOC3ID] || LOC3ID}
								defaultValue={this.state?.settings[LOC3ID]}
								placeholder={LOCATIONIDPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
							<TextInput
								style={[styles.locationInput, { marginHorizontal: gridMargin }]}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC3LAT, text)}
								key={this.state?.settings[LOC3LAT] || LOC3LAT}
								defaultValue={this.state?.settings[LOC3LAT]}
								placeholder={LATITUDEPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC3LON, text)}
								key={this.state?.settings[LOC3LON] || LOC3LON}
								defaultValue={this.state?.settings[LOC3LON]}
								placeholder={LONGITUDEPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>Location 4</Text>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC4ID, text)}
								key={this.state?.settings[LOC4ID] || LOC4ID}
								defaultValue={this.state?.settings[LOC4ID]}
								placeholder={LOCATIONIDPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
							<TextInput
								style={[styles.locationInput, { marginHorizontal: gridMargin }]}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC4LAT, text)}
								key={this.state?.settings[LOC4LAT] || LOC4LAT}
								defaultValue={this.state?.settings[LOC4LAT]}
								placeholder={LATITUDEPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(LOC4LON, text)}
								key={this.state?.settings[LOC4LON] || LOC4LON}
								defaultValue={this.state?.settings[LOC4LON]}
								placeholder={LONGITUDEPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
							/>
						</View>
						<View style={styles.settingsRow}>
							<Text style={styles.label}>HDMI-CEC</Text>
							<TextInput
								style={styles.locationInput}
								spellCheck={false}
								onChangeText={text => this.onChangeText(HDMICEC, text)}
								key={this.state?.settings[HDMICEC] || HDMICEC}
								defaultValue={this.state?.settings[HDMICEC]}
								placeholder={HDMICECPLACEHOLDER}
								placeholderTextColor={PLACEHOLDERCOLOR}
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
