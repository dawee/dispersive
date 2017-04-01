import React, { Component } from 'react';
import { createModel, createAction } from 'dispersive';
import { withField } from 'dispersive/field';
import { withOne, withMany } from 'dispersive/relation';
import { Watcher } from 'react-dispersive';
import request from 'request-promise-json';

const MAX_NUM = 151;  // limiting to first generation
const BASE_URL = 'http://pokeapi.co/api/v2/pokemon';
const range = n => [...Array(n).keys()];


/*
 * Models
 */

const Pokemon = createModel([
  withField('name'),
  withField('sprite'),
]);


const PokedexSlot = createModel([
  withField('num'),
  withField('active', { initial: false }),
  withField('seen', { initial: false }),
  withOne('pokemon', Pokemon),
]);


const Pokedex = createModel([
  withMany('slots', {model: PokedexSlot, relatedName: 'pokedex'}),
]);


/*
 * Actions
 */

const createPokedex = createAction(({ limit }) => {
  const pokedex = Pokedex.objects.create()

  pokedex.slots.add(range(limit).map(i => ({ num: i + 1 })))

  return pokedex;
}, [Pokedex, PokedexSlot]);

const setSlotActive = createAction(({key}) => {
  const slot = PokedexSlot.objects.get(key);
  const pokedex = slot.pokedex;
  const activated = pokedex.slots.filter({active: true});

  activated.update({active: false});
  slot.update({active: true});
}, [PokedexSlot]);

const updateSlotValues = createAction(
  ({key, ...values}) => PokedexSlot.objects.get({key}).update(values)
, [PokedexSlot]);

const setSlotPokemon = createAction(
  ({key, ...values}) => PokedexSlot.objects.get({key}).update({
    pokemon: Pokemon.objects.create(values),
  })
, [PokedexSlot, Pokemon]);

/*
 * Async function calling actions
 */

const setSlotSeen = async ({key}) => {
  updateSlotValues({key, seen: true});

  if (!PokedexSlot.objects.get(key).pokemon) {
    const { name, sprites } = await request.get(`${BASE_URL}/${PokedexSlot.objects.get(key).num}`);

    setSlotPokemon({ key, name, sprite: sprites.front_default });
  }
};

/*
 * Components
 */

const PokedexListSlot = ({ num, active, seen, pokemon, onActive, onSeen }) => (
  <li>
    <div>{`#${num}`} <span>{pokemon ? `(${pokemon.name})` : null}</span></div>
    <div>
      Details : <input type="checkbox" onMouseDown={ onActive } checked={ active } />
    </div>
    <div>
      Seen : <input type="checkbox" onMouseDown={ onSeen } checked={ seen } />
    </div>
  </li>
);


const PokedexList = ({ slots }) => (
  <ul>
    {slots.map(slot => (
      <PokedexListSlot
        { ...slot }
        onActive={ () => setSlotActive(slot) }
        onSeen={ () => setSlotSeen(slot) }
      />
    ))}
  </ul>
);

const PokemonInfos = ({ pokemon }) => (
  <div>
    {pokemon ? [
      <div key="name">{pokemon.name}</div>,
      <img key="sprite" src={pokemon.sprite} />
    ] : 'loading...'}
  </div>
);

const ActiveSlotInfos = ({ slot }) => (
  <div>
    <span>{`#${slot.num}`}</span>
    {slot.seen ? (
      <PokemonInfos pokemon={slot.pokemon} />
    ) : <div>This pokemon has never been seen</div>}
  </div>
);

const PokedexActiveSlotPanel = ({ slot }) => (
  <div className="active-slot-panel">
    {slot ? <ActiveSlotInfos slot={slot} /> : <span>No pokemon selected</span>}
  </div>
);

const PokedexView = ({ slots }) => (
  <div>
    <PokedexActiveSlotPanel slot={ slots.get({active: true}) } />
    <PokedexList slots={ slots } />
  </div>
);

const PokedexApp = ({ pokedex }) => <PokedexView { ...pokedex } />;


class App extends Component {

  state = {
    pokedex: createPokedex({limit: MAX_NUM})
  }

  render() {
    return (
      <Watcher models={[Pokemon, Pokedex, PokedexSlot]}>
        <PokedexApp pokedex={this.state.pokedex} />
      </Watcher>
    );
  }
}

export default App;
