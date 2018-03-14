# Hacking

## Awesome foundation

* [immer](https://github.com/mweststrate/immer) - painless immutability
* [material-ui](https://github.com/mui-org/material-ui) - huge but robust
* [rematch](https://github.com/rematch/rematch) - redux for humans
* [router5 ](https://github.com/router5/router5) - unpolluted renders

## Running

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

## 1.0 TODO

* [x] Multiple Taskfiles in a Taskproject
* [ ] Interactive JSON in Log History
* [ ] Dynamic forms via `Task.form` prop
* [ ] Not getting errors when taskfile is invalid
* [ ] Refactor large models like `taskfiles` into separate `effects`, `reducers`,
      `selectors` files.
* [ ] Dynamically add Taskfile to project
* [ ] Add `--harden` to prevent things like dynamically adding a `Taskfile`;
      passing in custom `argv`. Maybe this is the default when
      `NODE_ENV === 'production'` and task runs in `--gui` mode. In that case,
      it might be better to create `--dangerously-weak-mode` flag.
* [x] Tasks with same name are sharing history. Use `taskfileId` as additional
      discriminator
* [ ] Websocket disconnects a lot. Move to another library or maybe use
      `engine.io` or `primus` which is more battle tested? Stability is far
      more important than size.
* [ ] Add example database query plugin to exec simple queries.
      ```js
      import queryerPlugin from 'task-plugin-queryer'

      // returns {run, form, desc}
      export const queryer = queryerPlugin({
        conn: 'hostname=localhost username=postgres password=blah',
      })
      ```
* [ ] Should `Task.form` result in prompts on the CLI?
* [ ] Simplify the websocket resolvers on server. Should not have to build
      JSON packets manually.

      ```js
        return {c: 200, p: data}
        // SHOULD simply be
        return data


        return {c: 422, e: 'Some error'}
        // SHOULD be
        throw new ApiError(422, 'some error')

        // Any uncaught error results in
        {c:500, e: err}
      ```
* [ ] Watch mode should account for dependency watch globs.
* [ ] Task needs to be long-lived. Persist history in files named
      `taskfileId-taskName-pid-date.json`
* [ ] CLI and contrib polugins will under MIT license so anybody can run tasks
      without worry. The --api mode allows anyone to build their own UI
      on top of it.
* [ ] Lots of tests for the CLI
* [ ] bling: background image by project (Taskproject.json)
* [ ] bling: background iamge by taskfile (Taskproject.json)
* [ ] bling: themes


## License

[GNU AGPL v3.0](http://www.gnu.org/licenses/agpl-3.0.html)
