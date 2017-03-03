# dispersive

Flux with less code.

## Usage

Create **models**:

```js
const Tweet = createModel([
  withField('text'),
]);

const User = createModel([
  withField('name'),
  withMany('tweets', {model: Tweet, relatedName: 'user'}),
]);
```

Create **actions**:

```js
const fetchTweets = createAction(async name => {
  const tweets = await request.get(`http://twitter...${userName}`);
  const user = User.objects.getOrCreate({name});

  tweets.forEach(tweet => user.tweets.add(tweet));
}, [User, Tweet]);
```

Then update **render after each change**:

```js
Tweet.emitter.changed(() => {
  const hopefulcyborg = User.objects.get({name: 'hopefulcyborg'});

  console.log('here are hopefulcyborg tweets :');
  console.log(hopefulcyborg.tweets.map(({text}) => text));
})

fetchTweets('hopefulcyborg');
```
