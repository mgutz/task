import * as fp from 'path'
import * as fs from 'fs'

export const hello = {
  run: ({ argv }) => {
    console.log(`Hello, ${argv.name}!`);
    console.error('Random error 1');
    console.error('Another error 2');
    console.log('No error');
    console.error('Ooops, another error!');
  },
  ui: {
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

export const diagram = {
  desc: 'Generates PlantUML diagram',
  run: ({ argv, sh }) => {
    const file = argv.filename;
    const path = fp.resolve(file + '.puml');
    if (!fs.existsSync(path)) return console.error(`File does not exist: ${path}`);
    const cmd = `java -jar $DOTFILES/bin/plantuml.jar -charset UTF-8 -tpng ${path}`;
    sh.exec(cmd);
  },
  watch: ['./*.puml'],
  ui: {
    schema: {
      properties: {
        filename: {
          title: 'File',
          type: 'string',
          enum: [
            'diagram',
          ]
        }
      },
      required: ['filename']
    },
    form: [
      'filename'
    ],
    model: {
      filename: 'diagram'
    }
  },
};

export const lazy_ = async (ctx) => {
  const files = await ctx.globby(['./*.json'])
  return {
    run: (ctx) => {
      console.log(ctx.argv.filename)
    },
    ui: {
      schema: {
        properties: {
          filename: {
            title: 'File',
            type: 'string',
            enum: files
          }
        },
        required: ['filename']
      },
      form: [
        'filename'
      ],
      model: {
        filename: 'diagram'
      }
    },
  }
}


