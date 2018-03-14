export default {
  schema: `{
  "type": "object",
  "title": "Kitchen Sink test Schema Form",
  "properties": {
    "textWithDefault": {
      "title": "Text with default",
      "type": "string",
      "default": "Default Value"
    },
    "textNoDefault": {
      "title": "Text no default",
      "type": "string"
    },
    "email": {
      "title": "Email - Text With Regex and Description",
      "type": "string",
      "pattern": "^\\\\S+@\\\\S+$",
      "description": "General regex for email."
    },
    "staticDropdown": {
      "type": "string",
      "title": "Static Dropdown",
      "enum": [
        "LOCAL",
        "SIT1",
        "SIT2",
        "SIT3",
        "UAT1",
        "UAT2"
      ]
    },
    "textArea": {
      "title": "Text Area with Validation Message",
      "type": "string",
      "maxLength": 20,
      "validationMessage": "Don't be greedy!",
      "description": "Please write your comment here."
    },
    "helpMessage": {
      "title": "Help Message",
      "type": "string",
      "description": "This is the help value"
    },
    "checkbox": {
      "title": "Checkbox",
      "type": "boolean"
    },
    "date": {
      "title": "Date",
      "type": "date"
    },
    "name": {
      "title": "Name",
      "type": "string",
      "minLength": 3
    },
    "radios": {
      "title": "Basic radio button example",
      "type": "string",
      "enum": [
        "a",
        "b",
        "c"
      ]
    }
  },
  "required": [
    "name",
    "email"
  ]
}`,
  form: `[
  "name",
  "email",
  "textWithDefault",
  "textNoDefault",
  "staticDropdown",
  {
    "key": "textArea",
    "type": "textarea",
    "placeholder": "Make a comment"
  },
  {
    "key": "helpMessage",
    "type": "help"
  },
  {
    "key": "checkbox",
    "type": "toggleswitch"
  },
  {
    "key": "date",
    "type": "date"
  },
  {
    "key": "radios",
    "type": "radios",
    "titleMap": [
      {
        "value": "c",
        "name": "C"
      },
      {
        "value": "b",
        "name": "B"
      },
      {
        "value": "a",
        "name": "A"
      }
    ]
  }
]`,
}
