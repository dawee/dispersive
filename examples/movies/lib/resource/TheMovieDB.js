import request from 'superagent';
import moment from 'moment';
import qs from 'qs';


const baseURL = 'https://api.themoviedb.org/3/discover/movie';


class TheMovieDB {

  constructor() {
    this.query = {
      page: 0,
      api_key: 'b54fdd936c40e2df62dbfab8efa08c6b',
      'primary_release_date.gte': moment().startOf('week').format('YYYY-MM-DD'),
    };
  }

  fetchNext() {
    this.query.page++;
    return TheMovieDB.createRequestPromise(`${baseURL}?${qs.stringify(this.query)}`);
  }

  static createRequestPromise(url) {
    return new Promise(
      (resolve, reject) => request.get(url, (err, res) => !!err ? reject(err) : resolve(res.body))
    );
  }

}

export default TheMovieDB;