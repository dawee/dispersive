import hat from 'hat';
import dispatcher from './dispatcher';

const noop = (done) => done();

export const createAction = (handler) => {
  let actionType = hat();

  let wrapper = (...argv) => {

    argv.push((err, result) => {
      let data = result || {};
      data.actionType = actionType;
      dispatcher.dispatch(data);
    });

    (handler || noop).apply(null, argv);
  };

  wrapper.actionType = actionType;
  return wrapper;
};
