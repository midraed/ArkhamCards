import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// @ts-ignore
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';

import Switch from 'components/core/Switch';
import typography from 'styles/typography';
import space from 'styles/space';

interface Props {
  code: string;
  name: string;
  color?: {
    tint: string;
    primary: string;
  };
  selected: boolean;
  onChoiceToggle: (code: string) => void;
  editable: boolean;
}

export default class CheckListItemComponent extends React.Component<Props> {
  _toggle = () => {
    const {
      onChoiceToggle,
      code,
    } = this.props;
    onChoiceToggle(code);
  };

  render() {
    const {
      name,
      editable,
      color,
      selected,
    } = this.props;
    if (!editable && !selected) {
      return null;
    }
    return (
      <View style={[
        styles.row,
        space.paddingS,
        space.paddingSideM,
        color ? { backgroundColor: color.tint } : {},
      ]}>
        <Text style={[
          typography.mediumGameFont,
          styles.nameText,
        ]}>
          { name }
        </Text>
        { editable ? (
          <Switch
            onValueChange={this._toggle}
            customColor={color && color.primary}
            customTrackColor={color ? '#bbb' : undefined}
            value={selected}
          />
        ) : (
          <MaterialCommunityIcons
            name="check"
            size={18}
            color={color ? '#000' : '#222'}
          />
        ) }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  nameText: {
    fontWeight: '600',
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#888',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
