# MMM-Assistant2Display

Dev repository module to display in IFRAME
* PHOTOS (not set yet)
* WEB LINKS with auto-scrolling (Done)

FROM MMM-AssistantMk2

Needed : AMk2 v3.1.1-0dev with `responseConfig: { useA2D: true }`

```js
        {
           module: "MMM-Assistant2Display",
           config: {
             ui: "Classic2", // ui of AMk2 (available: Classic/Classic2/Fullscreen)
             debug:true, // debug mode
             verbose: false, // verbose of A2D Proxy
             displayDelay: 30 * 1000, // delay before closing iframe in ms
             scrollSpeed: 15, // scroll speed High number is low speed recommanded 15 
             scrollStart: 1000, // delay before scrolling in ms (after loaded url)
             proxyPort: 8081 // A2D proxy port
          }
        },
```

* Last Configuration update : 20/02/28
* Note module position needed because only with iframe
* Know bugs: exeption not done for youtube links
