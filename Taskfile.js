export const hello = ({argv}) => {
  console.log(`Hello, ${argv.name}!`);
  console.error('Random error 1');
  console.error('Another error 2');
  console.log('No error');
  console.error('Ooops, another error!');
};
