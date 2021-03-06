import React from 'react';
import { last } from 'lodash';
import { StyleSheet, Text, View } from 'react-native';
import { t } from 'ttag';

import { CAMPAIGN_COLORS, campaignNames } from './constants';
import { Campaign, CUSTOM } from 'actions/types';
import typography from 'styles/typography';
import Difficulty from './Difficulty';
import GameHeader from './GameHeader';
import BackgroundIcon from './BackgroundIcon';
import space from 'styles/space';

interface Props {
  campaign: Campaign;
  hideScenario?: boolean;
}
export default class CampaignSummaryComponent extends React.Component<Props> {
  latestScenario() {
    return last(this.props.campaign.scenarioResults);
  }

  renderCampaign() {
    const {
      campaign: {
        cycleCode,
        name,
      },
    } = this.props;
    const text = cycleCode === CUSTOM ? name : campaignNames()[cycleCode];
    return <GameHeader text={text} />;
  }

  renderLastScenario() {
    const { hideScenario, campaign } = this.props;
    if (hideScenario) {
      return null;
    }
    const latestScenario = this.latestScenario();
    if (latestScenario && latestScenario.scenario) {
      const resolution = latestScenario.resolution && !campaign.guided ?
        `: ${latestScenario.resolution}` : '';
      return (
        <View style={space.marginTopXs}>
          <Text style={typography.smallLabel}>
            { latestScenario.interlude ? t`LATEST INTERLUDE` : t`LATEST SCENARIO` }
          </Text>
          <Text style={typography.gameFont}>
            { `${latestScenario.scenario}${resolution}` }
          </Text>
        </View>
      );
    }
    return (
      <View style={space.marginTopXs}>
        <Text style={typography.text}>
          { t`Not yet started` }
        </Text>
      </View>
    );
  }

  render() {
    const {
      campaign,
    } = this.props;
    return (
      <View style={styles.row}>
        { campaign.cycleCode !== CUSTOM && (
          <BackgroundIcon code={campaign.cycleCode} color={CAMPAIGN_COLORS[campaign.cycleCode]} />
        ) }
        <View>
          { !!campaign.difficulty && <Difficulty difficulty={campaign.difficulty} /> }
          { this.renderCampaign() }
          { this.renderLastScenario() }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    position: 'relative',
  },
});
