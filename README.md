```js
const {createAction} = require('dispersive-core/action');
const {createModel} = require('dispersive-core/store/model');
const {withTextField} = require('dispersive-core/store/schema/text');
const {withMany} = require('dispersive-core/store/schema/relation');

const Tweet = createModel(withTextField('text'));

const User = createModel(
  withTextField('name'),
  withMany('tweets', {model: Tweet, relatedName: 'user'}),
);

const tweets = Tweet.objects.filter({[Tweet.user.name]: 'hopefulcyborg'});

const fetchTweets = createAction(async userName => {
  const user = User.objects.getOrCreate({userName});
  const res = await request.get(`http://twitter/api/user/${userName}/tweets`);

  res.body.forEach(tweet => user.tweets.add(tweet));
});

await fetchTweets('hopefulcyborg');
// End of action transaction:
// New version of Tweets.objects and User.objects has been created just now

tweets.map(tweet => console.log(tweet.text));
```
