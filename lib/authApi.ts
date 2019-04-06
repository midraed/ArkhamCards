import { forEach, keys, map } from 'lodash';
import { getAccessToken } from './auth';
import { Deck, Slots } from '../actions/types';

interface Params {
  [key: string]: string | number;
}

function cleanDeck(deck: Deck): Deck {
  if (deck) {
    if (!deck.ignoreDeckLimitSlots) {
      deck.ignoreDeckLimitSlots = {};
    }
  }
  return deck;
}

export function decks(lastModified?: string): Promise<{
  cacheHit: boolean,
  lastModified?: string,
  decks?: Deck[],
}> {
  return getAccessToken().then(accessToken => {
    if (!accessToken) {
      throw new Error('badAccessToken');
    }
    const uri = `https://arkhamdb.com/api/oauth2/decks?access_token=${accessToken}`;
    const headers = new Headers();
    if (lastModified) {
      headers.append('If-Modified-Since', lastModified);
    } else {
      headers.append('cache-control', 'no-cache');
      headers.append('pragma', 'no-cache');
    }
    const options: RequestInit = {
      method: 'GET',
      headers,
    };
    return fetch(uri, options).then(response => {
      if (response.status === 304) {
        return Promise.resolve({
          cacheHit: true,
        });
      }
      const lastModified = response.headers.get('Last-Modified');
      return response.json().then(json => {
        return {
          cacheHit: false,
          lastModified,
          decks: map(json || [], deck => cleanDeck(deck)),
        };
      });
    });
  });
}

export function loadDeck(id: number) {
  return getAccessToken().then(accessToken => {
    if (!accessToken) {
      throw new Error('badAccessToken');
    }
    const uri = `https://arkhamdb.com/api/oauth2/deck/load/${id}?access_token=${accessToken}`;
    return fetch(uri, {
      method: 'GET',
    }).then(response => {
      if (response.status === 500) {
        throw new Error('Not Found');
      }
      if (response.status !== 200) {
        throw new Error('Invalid Deck Status');
      }
      return response.json().then(deck => {
        if (deck && deck.id && deck.name && deck.slots) {
          return cleanDeck(deck);
        }
        throw new Error('Invalid Deck Response');
      });
    });
  });
}

function encodeParams(params: { [key: string]: string | number }) {
  return map(keys(params), key => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(`${params[key]}`)}`;
  }).join('&');
}

export function newCustomDeck(
  investigator: string,
  name: string,
  slots: { [code: string]: number },
  ignoreDeckLimitSlots: { [code: string]: number },
  problem: string
) {
  return newDeck(investigator, name)
    .then(deck => saveDeck(deck.id, deck.name, slots, ignoreDeckLimitSlots, problem, 0, 0));
}

export function newDeck(investigator: string, name: string) {
  return getAccessToken().then(accessToken => {
    if (!accessToken) {
      throw new Error('badAccessToken');
    }
    const uri = `https://arkhamdb.com/api/oauth2/deck/new?access_token=${accessToken}`;
    return fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: encodeParams({
        investigator: investigator,
        name: name,
      }),
    }).then(response => {
      return response.json().then(json => {
        if (!json.success) {
          throw new Error(json.msg);
        }
        return loadDeck(json.msg);
      });
    });
  });
}

export function saveDeck(
  id: number,
  name: string,
  slots: { [code: string]: number },
  ignoreDeckLimitSlots: { [code: string]: number },
  problem: string,
  spentXp: number,
  xpAdjustment?: number
) {
  return getAccessToken().then(accessToken => {
    if (!accessToken) {
      throw new Error('badAccessToken');
    }
    const uri = `https://arkhamdb.com/api/oauth2/deck/save/${id}?access_token=${accessToken}`;
    const bodyParams: Params = {
      name: name,
      slots: JSON.stringify(slots),
      problem: problem,
      xp_spent: spentXp,
      xp_adjustment: xpAdjustment || 0,
    };
    if (ignoreDeckLimitSlots && keys(ignoreDeckLimitSlots).length) {
      bodyParams.ignored = JSON.stringify(ignoreDeckLimitSlots);
    }
    const body = encodeParams(bodyParams);
    return fetch(uri, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body,
    }).then(response => {
      if (response.status !== 200) {
        throw new Error(`Non-200 Status: ${response.status}`);
      }
      return response.json();
    }, err => {
      return {
        success: false,
        msg: err.message || err,
      };
    }).then(json => {
      if (!json.success) {
        throw new Error(json.msg);
      }
      return loadDeck(json.msg);
    });
  });
}

export function upgradeDeck(id: number, xp: number, exiles?: string) {
  return getAccessToken().then(accessToken => {
    if (!accessToken) {
      throw new Error('badAccessToken');
    }
    const uri = `https://arkhamdb.com/api/oauth2/deck/upgrade/${id}?access_token=${accessToken}`;
    const params: Params = {
      xp: xp,
    };
    if (exiles) {
      params.exiles = exiles;
    }

    const body = encodeParams(params);
    return fetch(uri, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body,
    }).then(response => {
      if (response.status !== 200) {
        throw new Error(`Non-200 Status: ${response.status}`);
      }
      return response.json();
    }, err => {
      console.log(err.message || err);
      return {
        success: false,
        msg: err.message || err,
      };
    }).then(json => {
      if (!json.success) {
        throw new Error(json.msg);
      }
      return Promise.all([loadDeck(id), loadDeck(json.msg)]).then(values => {
        return {
          deck: values[0],
          upgradedDeck: values[1],
        };
      });
    });
  });
}

export default {
  decks,
  loadDeck,
  saveDeck,
  upgradeDeck,
  newDeck,
  newCustomDeck,
};