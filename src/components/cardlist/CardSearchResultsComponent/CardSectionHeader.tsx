import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from 'styles/colors';
import typography from 'styles/typography';
import space, { isBig } from 'styles/space';

interface Props {
  title: string;
  fontScale: number;
  bold?: boolean;
}
export function rowHeaderHeight(fontScale: number) {
  return (isBig ? 42 : 30) * fontScale;
}

export default function CardSectionHeader({ title, bold, fontScale }: Props) {
  return (
    <View style={[styles.row, { height: rowHeaderHeight(fontScale) }, bold ? styles.boldRow : {}]}>
      <Text style={[typography.text, styles.headerText, space.marginLeftS]}>
        { title }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#bdbdbd',
  },
  boldRow: {
    backgroundColor: '#ccc',
    borderColor: '#bdbdbd',
  },
  headerText: {
    color: COLORS.black,
  },
});
