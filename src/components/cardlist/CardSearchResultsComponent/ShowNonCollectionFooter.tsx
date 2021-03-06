import React from 'react';
import {
  View,
} from 'react-native';

import BasicButton from 'components/core/BasicButton';
import { isBig } from 'styles/space';

export function rowNonCollectionHeight(fontScale: number) {
  return (isBig ? 52 : 38) * fontScale + 16;
}

interface Props {
  id: string;
  title: string;
  fontScale: number;
  onPress: (id: string) => void;
}
export default class ShowNonCollectionFooter extends React.Component<Props> {
  _onPress = () => {
    this.props.onPress(this.props.id);
  }

  render() {
    const {
      title,
      fontScale,
    } = this.props;
    return (
      <View style={{ height: rowNonCollectionHeight(fontScale) }}>
        <BasicButton
          title={title}
          onPress={this._onPress}
        />
      </View>
    );
  }
}
