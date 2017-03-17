import React, { Component } from 'react';
import { createAction } from 'dispersive/action';
import { createModel } from 'dispersive/model';
import { withField } from 'dispersive/field';
import { withOne, withMany } from 'dispersive/relation';
import { Watcher } from 'react-dispersive';
import request from 'request-promise-json';

const MAX_NUM = 300;  // limiting to first generation
const BASE_URL = 'http://pokeapi.co/api/v2/pokemon';

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

const createPokedex = createAction(() => {
  const pokedex = Pokedex.objects.create();
  const slots = [...Array(MAX_NUM).keys()].map(
    index => PokedexSlot.objects.create({ num: index + 1 })
  );

  slots.forEach(slot => pokedex.slots.add(slot));

  return pokedex;
}, [Pokedex, PokedexSlot]);


const setSlotActive = createAction(({key}) => {
  const slot = PokedexSlot.objects.get(key);
  const pokedex = slot.pokedex;
  const activated = pokedex.slots.filter({active: true});

  activated.update({active: false});
  slot.update({active: true});
}, [PokedexSlot]);


const setSlotSeen = async ({key}) => {
  const setSeen = createAction(() => (
    PokedexSlot.objects.get(key).update({seen: true})
  ), [PokedexSlot]);

  const setPokemon = createAction(({name, sprites}) => {
    const pokemon = Pokemon.objects.create({ name, sprite: sprites.front_default });
    PokedexSlot.objects.get(key).update({ pokemon });
  }, [PokedexSlot, Pokemon]);

  setSeen();

  if (!PokedexSlot.objects.get(key).pokemon) {
    const feed = await request.get(`${BASE_URL}/${PokedexSlot.objects.get(key).num}`);

    setPokemon(feed);
  }
};

/*
 * Components
 */

class PokedexListSlot extends Component {
  shouldComponentUpdate({slot}) {
    const differentSlot = !this.props.slot.equals(slot);
    const addedPokemon = !this.props.slot.pokemon && !!slot.pokemon;

    return differentSlot || addedPokemon;
  }

  render() {
    const {slot} = this.props;

    return (
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
  }
}


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
