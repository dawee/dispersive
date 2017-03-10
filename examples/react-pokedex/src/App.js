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

const createPokedex = createAction(({limit}) => {
  const pokedex = Pokedex.objects.create();

  for (const num = 1; num <= limit; ++num) {
    pokedex.slots.add(PokedexSlot.objects.create(
      { url: `http://pokeapi.co/api/v2/pokemon/${num}`, num }
    ))
  }

  return pokedex;
}, [Pokemon, Pokedex, PokedexSlot]);

const setActiveSlot = createAction(async (slot) => (
  slot.pokemon = slot.pokemon || Pokemon.objects.create(await request.get(slot.url))
), [Pokemon, PokedexSlot]);

/*
 * Components
 */

const PokedexListSlot = ({slot}) => (
  <li onClick={() => setActiveSlot(slot)}>
    <span>{`#${slot.num}`}</span>
    {slot.pokemon ? <span>{slot.pokemon.name}</span> : null}
  </li>
);

const PokedexList = ({pokedex}) => (
  <ul>
  {pokedex ? pokedex.slots.orderBy('num').map(slot => (
    <PokedexListSlot slot={slot} key={slot.pk} />)
  ) : null}
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
