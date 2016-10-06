import {createAction} from 'dispersive';
import TheMovieDB from './resource/TheMovieDB';


const actions = {};
const theMoviesDB = new TheMovieDB();


actions.fetchMovies = createAction(() => theMoviesDB.fetchNext());
actions.boot = createAction(actions.fetchMovies);


export default actions;