import { showInstallAlert } from '@ui/components/internal/install-modal';
import { ReactNative as RN } from '@metro/common';
import { Section, TintedIcon } from '@ui/components/misc';

import useStyles from './fonts.style';
import { Icons } from '@api/assets';
import { Redesign } from '@metro/components';
import { useSettingsStore } from '@api/storage';

function FontsPage() {
	const [selected, setSelected] = React.useState('');
	const store = useSettingsStore('unbound');
	const styles = useStyles();

	const states = store.get('font-states', {});

	return <RN.ScrollView style={styles.container}>
		<RN.View>
			<RN.Text>
				{states['*'] ?? 'No override selected.'}
			</RN.Text>
		</RN.View>
		<Section>
			<Redesign.TableRadioGroup
				key='custom'
				onChange={v => store.set('font-states', { '*': v })}
				value={states['*']}
			>
				{ }
			</Redesign.TableRadioGroup>

			<Redesign.TableRadioGroup
				key='system'
				onChange={v => store.set('font-states', { '*': v })}
				value={states['*']}
			>
				<Redesign.TableRadioRow
					value={null}
					style={styles.fontWrapper}
					label='No override'
					icon={<Redesign.TableRowIcon source={Icons.Debug} />}
				/>

				{(window.UNBOUND_AVAILABLE_FONTS ?? []).map(font => {
					return <Redesign.TableRadioRow
						value={font}
						style={styles.fontWrapper}
						label={<RN.Text style={{ ...styles.fontLabel, fontSize: 18, fontFamily: font }}>
							{font}
						</RN.Text>}

						icon={<Redesign.TableRowIcon source={Icons.Debug} />}
					/>;
				})}
			</Redesign.TableRadioGroup>
		</Section>
	</RN.ScrollView>;
}

export const callback = ({ type, ref }) => showInstallAlert({ type, ref });
export default {
	page: <FontsPage />,
	callback,
	icon: <TintedIcon source={Icons['ic_add_text']} />
};