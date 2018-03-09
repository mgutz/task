# Hacking

## Recommended Tools

* vs.code

  * Code Outline by Patryk Zawadzki
  * EditorConfig by EditorConfig
  * ESLint by Dirk Baeumer
  * GraphQL for VSCode by Kumar Harsh
  * Prettier by Esben Petersen
  * Sort Typescript Imports
  * TSLint by egamma

* node LTS

## GraphQL Server

To run

```sh
tsc && task server -w
```

then browse http://localhost:4200/graphql to view the graphiql interface.

Try

```
{
  tasks {
    name
    description
  }
}
```

Or

```
mutation {
  run(name: "hello", argv: "{\"name\": \"foo\"}") {
    code
    message
    payload
  }
}
```

## Testing

To run tests

```sh
tsc && task test
```
