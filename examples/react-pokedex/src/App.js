import React, { Component } from 'react';
import { createModel, createAction } from 'dispersive';
import { runAsAction } from 'dispersive/action';
import { withField } from 'dispersive/field';
import { withOne, withMany } from 'dispersive/relation';
import { Watcher } from 'react-dispersive';
import request from 'request-promise-json';

const MAX_NUM = 300;  // limiting to first generation
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


const store = [Pokedex, PokedexSlot, Pokemon];

/*
 * Actions
 */

const createPokedex = createAction(() => (
  Pokedex.objects.create().slots.add(range(MAX_NUM).map(i => ({ num: i + 1 })))
), store);

const setSlotActive = createAction(({key}) => {
  const slot = PokedexSlot.objects.get(key);
  const pokedex = slot.pokedex;
  const activated = pokedex.slots.filter({active: true});

  activated.update({active: false});
  slot.update({active: true});
}, store);

const updateSlotValues = createAction(
  ({key, ...values}) => PokedexSlot.objects.get({key}).update(values)
, store);

const setSlotPokemon = createAction(
  ({key, ...values}) => PokedexSlot.objects.get({key}).update({
    pokemon: Pokemon.objects.create(values),
  })
, store);

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

const PokedexListSlot = ({slot}) => (
  <li>
    <div>{`#${slot.num}`} <span>{slot.pokemon ? `(${slot.pokemon.name})` : null}</span></div>
    <div>
      Details :
      <input onMouseDown={() => setSlotActive(slot)} type="checkbox" checked={slot.active} />
    </div>
    <div>
      Seen :
      <input onMouseDown={() => setSlotSeen(slot)} type="checkbox" checked={slot.seen} />
    </div>
  </li>
);


const PokedexList = ({pokedex}) => (
  <ul>
    {pokedex ? pokedex.slots.orderBy('num').map(slot => (
      <PokedexListSlot slot={slot} key={slot.key} />)
    ) : null}
  </ul>
);

const PokemonInfos = ({pokemon}) => (
  <div>
    {pokemon ? [
      <div key="name">{pokemon.name}</div>,
      <img key="sprite" src={pokemon.sprite} />
    ] : 'loading...'}
  </div>
);

const ActiveSlotInfos = ({slot}) => (
  <div>
    <span>{`#${slot.num}`}</span>
    {slot.seen ? (
      <PokemonInfos pokemon={slot.pokemon} />
    ) : <div>This pokemon has never been seen</div>}
  </div>
);

const PokedexActiveSlotPanel = ({slot}) => (
  <div className="active-slot-panel">
    {slot ? <ActiveSlotInfos slot={slot} /> : <span>No pokemon selected</span>}
  </div>
);

const PokedexView = ({pokedex}) => pokedex ? (
  <div>
    <PokedexActiveSlotPanel slot={pokedex.slots.get({active: true})} />
    <PokedexList pokedex={pokedex} />
  </div>
) : null;

const PokedexApp = () => <PokedexView pokedex={Pokedex.objects.get()} />;

class App extends Component {
  componentDidMount() {
    createPokedex({limit: MAX_NUM});
  }

  render() {
    return (
      <Watcher models={[Pokemon, Pokedex, PokedexSlot]}>
        <PokedexApp />
      </Watcher>
    );
  }
}

export default App;
