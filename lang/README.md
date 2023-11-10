# Client NLS

This directory contains all the NLS bundles for the client side code. The
english bundles should never be modified in here, they will be automatically generated
when running the build. It can also be generated
using the `npm run extract:messages` command to be sent for translations.
This will scan through the client side source code for messages and will populate
the messages in lang/en.json file which will be used by akora-app-noi.

Once the translations for supported languages are received, they need to be added
to lang directory and merged to the master branch.
