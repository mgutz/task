# GUI

Graphql-based GUI

## Running

To run

```sh
task gqlserver -w
```

Browse `http://localhost/graphql` and enter query

```graphql
{
  tasks {
   name
  }
}
```

## Notes

All code must be plain node. No fancy ES6


