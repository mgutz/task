export const hello = {
  run: ({argv}) => {
    console.log(`Hello, ${argv.name}!`);
    console.error('Random error 1');
    console.error('Another error 2');
    console.log('No error');
    console.error('Ooops, another error!');
  },
  form:  {
    // validation schema
    schema: {
      type: 'object',
      properties: {
        name: {
          title: 'Name',
          type: 'string',
        },
      },
      required: ['name']
    },
    // form ui
    form: [
      'name'
    ]
  }
};
