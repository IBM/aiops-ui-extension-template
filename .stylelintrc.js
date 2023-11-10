module.exports = {
    'extends': 'stylelint-config-sass-guidelines',
    'rules': {
        'max-nesting-depth': 4,
        'selector-max-compound-selectors': 4,
        'selector-no-qualifying-type':  [
            true,
            {
              "ignore": ["class"]
            }
        ],
        'selector-class-pattern': null
    }
};
