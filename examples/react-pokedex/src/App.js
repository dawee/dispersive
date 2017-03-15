import React, { Component } from 'react';
import { createAction } from 'dispersive/action';
import { createModel } from 'dispersive/model';
import { withField } from 'dispersive/field';
import { withOne, withMany } from 'dispersive/relation';
import { Watcher } from 'react-dispersive';
import request from 'request-promise-json';

const MAX_NUM = 151;  // limiting to first generation
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

const createPokedex = createAction(({limit}) => {
  const pokedex = Pokedex.objects.create();
  const slots = [...Array(MAX_NUM).keys()].map(
    index => PokedexSlot.objects.create({ num: index + 1 })
  );

  slots.forEach(slot => pokedex.slots.add(slot));

  return pokedex;
}, [Pokedex, PokedexSlot]);


const setSlotActive = createAction(({pk}) => {
  const current = PokedexSlot.objects.get(pk).pokedex.slots.filter({active: true});

  current.update({active: false});
  PokedexSlot.objects.get(pk).update({active: true});
}, [PokedexSlot]);


const setSlotSeen = async ({pk}) => {
  const setSeen = createAction(() => (
    PokedexSlot.objects.get(pk).update({seen: true})
  ), [PokedexSlot]);

  const setPokemon = createAction(({name, sprites}) => {
    const pokemon = Pokemon.objects.create({ name, sprite: sprites.front_default });
    PokedexSlot.objects.get(pk).update({ pokemon });
  }, [PokedexSlot, Pokemon]);

  await setSeen();

  if (!PokedexSlot.objects.get(pk).pokemon) {
    const feed = await request.get(`${BASE_URL}/${PokedexSlot.objects.get(pk).num}`);

    await setPokemon(feed);
  }
};

/*
 * Components
 */

const PokedexListSlot = ({slot}) => (
  <li>
    <div>{`#${slot.num}`}</div>
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
      <PokedexListSlot slot={slot} key={slot.pk} />)
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

const PokedexActiveSlotPanel = ({slot}) => (
  <div className="active-slot-panel">
    {slot ? (
      <div>
        <span>{`#${slot.num}`}</span>
        {slot.seen ? (
          <PokemonInfos pokemon={slot.pokemon} />
        ) : <div>This pokemon has never been seen</div>}
      </div>
    ) : <span>No pokemon selected</span>}
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
      <Watcher sources={[Pokemon, Pokedex, PokedexSlot]}>
        <PokedexApp />
      </Watcher>
    );
  }
}

export default App;
