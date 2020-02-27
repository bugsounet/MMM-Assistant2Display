# MMM-Assistant2Display

Dev repository module to display in IFRAME
* PHOTOS
* WEB LINKS with auto-scrolling

FROM MMM-AssistantMk2

DON'T USE IT

Needed : AMk2 v3.1.1-0dev with `responseConfig: { useA2D: true }`

```js
        {
           module: "MMM-Assistant2Display",
           config: {
             debug:true, // debug mode
             verbose: false, // verbose of A2D Proxy
             displayDelay: 30 * 1000, // delay before closing iframe in ms
             //displayHelpWord: false // not yet implented
             scrollSpeed: 15, // scroll speed High number is low speed recommanded 15 
             scrollStart: 1000, // delay before scrolling in ms (after loaded url)
             proxyPort: 8081 // A2D proxy port
          }
        },
```

* Last Configuration update : 20/02/27
* Note module position needed because only with iframe
