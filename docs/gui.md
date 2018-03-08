# GUI

Graphql-based GUI

## Running

To run

```sh
task server -w
```

Browse `http://localhost/graphql`

To do a query

```graphql
{
  tasks {
   name
  }
}
```

To exec a mutation

```graphql
mutation {
    run(ref: "foo") {
      code
      message
    }
}
```

## Notes

All code must be plain node. No fancy ES6


