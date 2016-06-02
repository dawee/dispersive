# dawee's Flux

ES6 Flux lib based on facebook [Emitter](https://github.com/facebook/emitter)/[Dispatcher](https://github.com/facebook/flux).


## Installation

```
npm install dwflux
```

## Usage

### Create an Action

```js
import {createAction} from 'dwflux/action';

const clickOnStuff = createAction((evt, done) => {
  done(null, {
    x: evt.nativeEvent.screenX,
    y: evt.nativeEvent.screenY
  });
});
```

#### Trigger an Action

```js
  onMouseClick(evt) {
    clickOnStuff(evt);
  }
```

#### Create a Store

```js
import Store from 'dwflux/store';

class SelectionStore extends Store {
  
  constructor() {
    super();
    this.register(clickOnStuff, this.selectStuff);
  }

  selectStuff(opts) {
    this.selection = {x: opts.x, y: opts.y}
    this.emit('change');
  }
}
```

#### Listen to Store changes


```js
const selectionStore = new SelectionStore();

selectionStore.on('change', function () {
  // Update your view/component here
});
```

