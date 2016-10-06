import {createAction} from 'dispersive';
import TheMovieDB from './resource/TheMovieDB';


const actions = {};
const theMoviesDB = new TheMovieDB();

actions.fetchLastMovies = createAction(() => theMoviesDB.fetchNext());
actions.boot = createAction(() => actions.fetchLastMovies());


export default actions;