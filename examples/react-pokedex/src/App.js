import React, { Component } from 'react';
import { createAction } from 'dispersive/action';
import { createModel } from 'dispersive/model';
import { withField } from 'dispersive/field';
import { withOne, withMany } from 'dispersive/relation';
import { Watcher } from 'react-dispersive';
import request from 'request-promise-json';

const MAX_NUM = 151;  // limiting to first generation
const POKEMON_URL = 'http://pokeapi.co/api/v2/pokemon';


/*
 * Models
 */

const Pokemon = createModel([
  withField('name'),
  withField('sprite'),
]);

const PokedexSlot = createModel([
  withField('num'),
  withField('active'),
  withField('loading', { initial: false }),
  withField('seen', { initial: false }),
  withField('captured', { initial: false }),
  withOne('pokemon', Pokemon),
]);

const Pokedex = createModel([
  withMany('slots', {model: PokedexSlot, relatedName: 'pokedex'}),
]);

/*
 * Actions
 */

const createPokedex = createAction(({limit}) => {
  const pokedex = Pokedex.objects.create();

  for (const num = 1; num <= limit; ++num) {
    pokedex.slots.add(PokedexSlot.objects.create({ num }))
  }

  return pokedex;
}, [Pokedex, PokedexSlot]);

const setActiveSlot = createAction((slot) => {
  slot.pokedex.slots.filter({active: true}).update({update: false});
  slot.update({active: true});
}, [PokedexSlot]);

const setSlotDownloading = createAction((slot, downloading) => slot.update({downloading}), [PokedexSlot]);

const addPokemonOnSlot = createAction(async (slot) => {
  const data = await request(`${POKEMON_URL}/${slot.num}`);

  slot.pokemon = Pokemon.objects.create(data);
}, [Pokemon, PokedexSlot])

const setSlotVisible = async (slot) => {
  if (!slot.pokemon) {
    await setSlotDownloading(slot, true);
    await addPokemonOnSlot(slot);
    await setSlotDownloading(slot, false);
  }
}

/*
 * Components
 */

class PokedexListSlot extends Component {

  shouldComponentUpdate({slot}) {
    return !this.props.slot.equals(slot);
  }

  render() {
    console.log('render', Date.now())
    const {slot} = this.props;

    return (
      <li onMouseDown={() => {console.log('click', Date.now());setActiveSlot(slot)} }>
        {`#${slot.num}`}
        <span>{slot.active ? 'active' : null}</span>
      </li>
    );
  }
}

const PokedexList = ({pokedex}) => {

  return (
  <ul>
  {pokedex ? pokedex.slots.orderBy('num').map(slot => (
    <PokedexListSlot slot={slot} key={slot.pk} />)
  ) : null}
  </ul>
)};

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
