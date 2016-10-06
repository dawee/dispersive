import request from 'superagent';
import qs from 'qs';
import moment from 'moment';
import {createAction} from 'dispersive';


const query = qs.stringify({
  'primary_release_date.lte': moment().add(1, 'month').endOf('month').format('YYYY-MM-DD'),
  'primary_release_date.gte': moment().add(1, 'month').startOf('month').format('YYYY-MM-DD'),
  api_key: 'b54fdd936c40e2df62dbfab8efa08c6b',
});

const url = `https://api.themoviedb.org/3/discover/movie?${query}`;
const actions = {};

actions.fetchLastMovies = createAction(() => new Promise(
  (resolve) => request.get(url, (err, res) => resolve(res.body))
));

actions.boot = createAction(() => actions.fetchLastMovies());


export default actions;