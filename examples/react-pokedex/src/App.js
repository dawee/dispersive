import React, { Component } from 'react';
import { createAction } from 'dispersive/action';
import { createModel } from 'dispersive/model';
import { withField } from 'dispersive/field';
import { withOne, withMany } from 'dispersive/relation';
import { Watcher } from 'react-dispersive';
import request from 'request-promise-json';

const MAX_NUM = 151;  // limiting to first generation
const POKEDEX_URL = 'http://pokeapi.co/api/v2/pokemon/';


/*
 * Models
 */

const Pokemon = createModel([
  withField('name'),
  withField('sprite'),
  withField('seen', { initial: false }),
  withField('captured', { initial: false }),
]);

const PokedexSlot = createModel([
  withField('num'),
  withField('url'),
  withOne('pokemon', Pokemon),
]);

const Pokedex = createModel([
  withOne('activePokemon', Pokemon),
  withMany('slots', PokedexSlot),
]);

/*
 * Actions
 */

const createPokedex = createAction(async ({limit}) => {
  const pokedex = Pokedex.objects.create();
  let nextUrl = POKEDEX_URL;

  while (pokedex.slots.length < limit && nextUrl) {
    const {next, results} = await request.get(nextUrl);

    results.forEach(({url}) => {
      if (pokedex.slots.length === limit) return;

      pokedex.slots.add(PokedexSlot.objects.create(
        { url, num: pokedex.slots.length + 1 }
      ));
    })

    nextUrl = next;
  }

  return pokedex;
}, [Pokemon, Pokedex, PokedexSlot]);

/*
 * Components
 */

const PokedexListSlot = ({slot}) => (
  <li>
  </li>
);

const PokedexLoader = () => (
  <span>Pokedex is loading ...</span>
);

const PokedexList = ({pokedex}) => (
  <ul>
  {pokedex ? pokedex.slots.map(slot => (
    <PokedexListSlot slot={slot} key={slot.pk} />)
  ) : <PokedexLoader />}
  </ul>
);

const PokedexApp = () => (
  <div className="pokedex-app">
    <PokedexList pokedex={Pokedex.objects.get()} />
  </div>
);

class App extends Component {

  componentDidMount() {
    createPokedex({limit: MAX_NUM});
  }

  render() {
    return (
      <Watcher sources={[Pokemon, Pokedex, PokedexSlot]}>
        <PokedexApp />
      </Watcher>
    );
  }
}

export default App;
