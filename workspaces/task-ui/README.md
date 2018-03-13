# Hacking

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

To run

```sh
yarn start
```

## Redux Store

Rematch is redux under the hood. To see the store in the console, use
`window.DBG.store`

## Websockets

Websocket client has been added to `window.DBG.ws`

To invoke

```js
window.DBG.ws.invoke('tasks').then(console.log, console.error)
```

## Browser and vs.code Freezing in VM

There are band-aids and makes the crashes less frequent.

Set some flags related to GPU

[Chrome freeze very frequently with ubuntu 16.04](https://askubuntu.com/a/894683)

Code add this to your .zshrc or .bashrc, which will run code with --disable-gpu

```sh
function code {
  command code $1 --disable-gpu
}
```

## TODO

* [ ] Multiple Taskfiles
