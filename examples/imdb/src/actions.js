import request from 'superagent';
import {createAction} from 'dispersive';

const url = 'https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=2016-07-01&primary_release_date.lte=2016-10-01&api_key=b54fdd936c40e2df62dbfab8efa08c6b';
const actions = {};

actions.fetchLastMovies = createAction(() => new Promise(
  (resolve) => request.get(url, (err, res) => resolve(res.body))
));


export default actions;