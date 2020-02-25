# MMM-Assistant2Display

Dev repository module to display in IFRAME
* PHOTOS
* WEB LINKS

FROM MMM-AssistantMk2

DON'T USE IT


```js
        {
           module: "MMM-Assistant2Display",
           config: {
             debug:true, // debug mode
             displayDelay: 30 * 1000, // delay before closing iframe in ms
             displayHeight: 20000, // max height of document reading
             //displayHelpWord: false // not yet implented
             scrollSpeed: 1, // scroll speed High number is high speed recommanded 1 or 2 (0: no scroll) 
             scrollInitDelay: 1000 // delay before scrolling in ms (after loaded url)
          }
        },
```
