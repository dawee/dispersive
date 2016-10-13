import {createAction} from 'dispersive';
import TheMovieDB from './resource/TheMovieDB';

const actions = {};
const resource = new TheMovieDB();

actions.fetchMovies = createAction(() => resource.fetchNext());
actions.boot = createAction(() => actions.fetchMovies());

export default actions;
