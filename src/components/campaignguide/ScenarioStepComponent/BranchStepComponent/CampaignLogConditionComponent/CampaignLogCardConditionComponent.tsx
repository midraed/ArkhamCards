import React from 'react';
import { find } from 'lodash';
import { t } from 'ttag';

import BinaryResult from '../../../BinaryResult';
import SingleCardWrapper from '../../../SingleCardWrapper';
import { LogEntryCard } from 'data/scenario/CampaignGuide';
import { BranchStep, CampaignLogCondition } from 'data/scenario/types';
import GuidedCampaignLog from 'data/scenario/GuidedCampaignLog';
import Card from 'data/Card';

interface Props {
  step: BranchStep;
  entry: LogEntryCard;
  condition: CampaignLogCondition;
  campaignLog: GuidedCampaignLog;
}

export default class CampaignLogCardConditionComponent extends React.Component<Props> {
  _renderCard = (card: Card) => {
    const { step, condition, campaignLog, entry } = this.props;
    const trueResult = find(condition.options, option => option.boolCondition === true);
    const falseResult = find(condition.options, option => option.boolCondition === false);
    const result = campaignLog.check(condition.section, condition.id);
    const negated = !!falseResult && !trueResult;
    const prompt = negated ?
      t`If <i>${card.name}</i> is not listed under Check ‘${entry.section}’ in your Campaign Log.` :
      t`If <i>${card.name}</i> is listed under Check ‘${entry.section}’ in your Campaign Log.`;

    return (
      <BinaryResult
        prompt={prompt}
        bulletType={step.bullet_type}
        result={negated ? !result : result}
      />
    );
  };

  render() {
    const { entry } = this.props;
    return (
      <SingleCardWrapper
        code={entry.code}
        render={this._renderCard}
        extraArg={undefined}
      />
    );
  }
}
