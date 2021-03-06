import React from 'react';
import { map, sortBy } from 'lodash';
import { t } from 'ttag';

import Card from 'data/Card';
import { BASIC_WEAKNESS_QUERY } from 'data/query';
import withWeaknessCards, { WeaknessCardProps } from 'components/weakness/withWeaknessCards';
import SelectWeaknessTraitsComponent from './SelectWeaknessTraitsComponent';
import DrawRandomWeaknessComponent from './DrawRandomWeaknessComponent';
import InvestigatorChoicePrompt from 'components/campaignguide/prompts/InvestigatorChoicePrompt';
import InvestigatorSelectorWrapper from 'components/campaignguide/InvestigatorSelectorWrapper';
import BinaryPrompt from 'components/campaignguide/prompts/BinaryPrompt';
import { AddWeaknessEffect } from 'data/scenario/types';
import ScenarioStateHelper from 'data/scenario/ScenarioStateHelper';
import ScenarioStepContext, { ScenarioStepContextType } from 'components/campaignguide/ScenarioStepContext';
import CardQueryWrapper from 'components/campaignguide/CardQueryWrapper';
import { safeValue } from 'lib/filters';

interface OwnProps {
  id: string;
  effect: AddWeaknessEffect;
  input?: string[];
}

type Props = OwnProps & WeaknessCardProps;

class AddWeaknessEffectComponent extends React.Component<Props> {
  static contextType = ScenarioStepContext;
  context!: ScenarioStepContextType;

  firstDecisionId() {
    return `${this.props.id}_use_app`;
  }

  traitsDecisionId() {
    return `${this.props.id}_traits`;
  }

  renderFirstPrompt() {
    return (
      <BinaryPrompt
        id={this.firstDecisionId()}
        bulletType="small"
        text={t`Do you want to use the app to randomize weaknesses?`}
      />
    );
  }

  _renderCardChoice = (cards: Card[], investigators: Card[]) => {
    const { id } = this.props;
    return (
      <InvestigatorChoicePrompt
        bulletType="none"
        investigators={investigators}
        id={`${id}_weakness`}
        options={{
          type: 'universal',
          choices: map(
            sortBy(cards, card => card.name),
            card => {
              return {
                id: card.code,
                code: card.code,
                text: card.name,
              };
            }
          ),
        }}
      />
    );
  };

  _saveTraits = (traits: string[]) => {
    this.context.scenarioState.setStringChoices(
      this.traitsDecisionId(), {
        traits,
      });
  };

  _renderSecondPrompt = (
    investigators: Card[],
    scenarioState: ScenarioStateHelper
  ) => {
    const {
      id,
      effect,
      cards,
      cardsMap,
    } = this.props;
    const useAppDecision = scenarioState.decision(this.firstDecisionId());
    if (useAppDecision === undefined) {
      return null;
    }
    if (!useAppDecision) {
      const traitPart = map(effect.weakness_traits,
        trait => `(real_traits_normalized CONTAINS[c] "${safeValue(trait)}")`
      ).join(' OR ');
      const query = traitPart ?
        `(${BASIC_WEAKNESS_QUERY} AND (${traitPart}))` :
        BASIC_WEAKNESS_QUERY;
      return (
        <CardQueryWrapper
          query={query}
          render={this._renderCardChoice}
          extraArg={investigators}
        />
      );
    }
    const traitsChoice = effect.select_traits ?
      scenarioState.stringChoices(this.traitsDecisionId()) :
      undefined;
    const chosenTraits: string[] | undefined = traitsChoice && traitsChoice.traits;
    return (
      <>
        { !!effect.select_traits && (
          <SelectWeaknessTraitsComponent
            cards={cards}
            cardsMap={cardsMap}
            choices={chosenTraits}
            save={this._saveTraits}
            scenarioState={scenarioState}
          />
        ) }
        { (!effect.select_traits || chosenTraits !== undefined) && (
          <DrawRandomWeaknessComponent
            id={id}
            traits={chosenTraits || effect.weakness_traits}
            realTraits={!chosenTraits}
            investigators={investigators}
            campaignLog={this.context.campaignLog}
            scenarioState={this.context.scenarioState}
            cards={cards}
            cardsMap={cardsMap}
          />
        ) }
      </>
    );
  }

  render() {
    const { id, effect, input } = this.props;
    return (
      <ScenarioStepContext.Consumer>
        { ({ scenarioState }: ScenarioStepContextType) => (
          <>
            { this.renderFirstPrompt() }
            <InvestigatorSelectorWrapper
              id={id}
              investigator={effect.investigator}
              input={input}
              render={this._renderSecondPrompt}
              extraArg={scenarioState}
            />
          </>
        ) }
      </ScenarioStepContext.Consumer>
    );
  }
}

export default withWeaknessCards<OwnProps>(
  AddWeaknessEffectComponent
);
