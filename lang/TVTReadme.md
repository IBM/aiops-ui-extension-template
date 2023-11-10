The en file to be translated in supported languages is supplied in the
below format:

{
  "<ID>": {
    "defaultMessage": "Message to be translated 1",
    "description": "Description of where the message is used. DO NOT TRANSLATE"
  },
  "<ID1>": {
    "defaultMessage": "Message to be translated 2",
    "description": "Description of where the message is used. DO NOT TRANSLATE"
  }
}

As indicated above, only the text for 'defaultMessage' has to be translated,
but the 'description' must not be translated.
Please return the translated bundles for each supported locales in the same format.
