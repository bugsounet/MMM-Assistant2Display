# MMM-Assistant2Display

This module is an addons for MMM-AssistantMk2.

It allows to display the links and photos found by your assistant.

Needed: AMk2 v3.1.1-0 with `config: { addons: true }`

## Configuration
To display the module insert it in the config.js file. Here is an example:

### Minimal configuration

```js
  {
     module: "MMM-Assistant2Display",
     config: {
       ui: "AMk2",
     }
   },
```

### Personalized configuration
this is the default configuration defined, if you don't define any value

```js
  {
     module: "MMM-Assistant2Display",
     config: {
       ui: "AMk2", 
       displayDelay: 30 * 1000,
       scrollSpeed: 15,
       scrollStart: 1000,
       proxyPort: 8081,
       debug: false,
       verbose: false,
     }
  },
```

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| ui | ui type: Classic/Classic2/Fullscreen or AMk2 for automatic choice from AMk2 config | Boolean | AMk2 |
| displayDelay | delay before closing iframe in ms | Integer | 30 * 1000 |
| scrollSpeed | scroll speed High number is low speed recommanded 15 | Integer | 15 |
| scrollStart | delay before scrolling in ms (after url loaded ) | Integer | 1000 |
| proxyPort | A2D Proxy port | Integer | 8081 |
| debug | debug mode | Boolean | false |
| verbose | verbose mode of A2D Proxy (debug needed) | Boolean | false |


* Last Configuration update : 20/03/01
* Note: module position not needed because only with iframe
