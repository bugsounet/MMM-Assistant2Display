# MMM-Assistant2Display

This module is an addons for MMM-AssistantMk2.

It allows to display the links, photos and YouTube video found by your assistant.

You can control MagicMirror sound volume

Needed: AMk2 v3.1.1-3 with special configuration

Turn on `addons: true` in your AMk2 config.js file

`config: { addons: true }`

## Screenshoot

 ![](https://raw.githubusercontent.com/bugsounet/MMM-Assistant2Display/dev/screenshoot2.jpeg)
 ![](https://raw.githubusercontent.com/bugsounet/MMM-Assistant2Display/dev/screenshoot1.jpg)

## Update history
 * 22/03/2020 (V1.1.1)
   * **FIX**: Always screen up when YT display and assistant query
   * **FIX**: Always screen up when on next playlist YT
 * 19/03/2020 (V1.1.0)
   * **ADD**: YouTube support with all AMk2 ui
   * **ADD**: Title display in Classic / Classic2 ui (beta)
   * **ADD**: vocal sound control
   * **ADD**: screen addon control (screen addon v1.0.4 needed)
   * **ADD**: feature activation sub modules choice 

## Installation

```sh
cd ~/MagicMirror/modules
git clone https://github.com/bugsounet/MMM-Assistant2Display.git
cd MMM-Assistant2Display
npm install
```

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
       sandbox: null,
       useLinks: true,
       usePhotos: true,
       useYoutube: true,
       useVolume: true,
       volumePreset: "ALSA"
     }
  },
```

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| ui | ui type: Classic/Classic2/Fullscreen or AMk2 for automatic choice from AMk2 config | String | AMk2 |
| displayDelay | delay before closing iframe in ms | Integer | 30 * 1000 |
| scrollSpeed | scroll speed High number is low speed recommanded 15 | Integer | 15 |
| scrollStart | delay before scrolling in ms (after url loaded ) | Integer | 1000 |
| proxyPort | A2D Proxy port | Integer | 8081 |
| debug | debug mode | Boolean | false |
| verbose | verbose mode of A2D Proxy (debug needed) | Boolean | false |
| sandbox | This attribute allows you to apply restrictions on the content that can appear in the iframe. Set `null` to desactivate | String | null |
| useLinks | display discovered web links | Boolean | true |
| usePhotos | display discovered photos | Boolean | true |
| useYoutube | display youtube video | Boolean| true |
| useVolume | allow volume control | Boolean | true |
| volumePreset | preset configuration type. available : ALSA, PULSE, HIFIBERRY-DAC,RESPEAKER_SPEAKER, RESPEAKER_PLAYBACK, OSX  | String | ALSA |

* Notes:
  * module position not needed because only with iframe
  * if you want to stop link/photo or youtube video displaying: just say `stop`
  * if you want to control sound volume of your mirror: just say `volume 5` (mini volume is 0, maximum is 10)
  * this module control AMk2 screen addon when you use this module (It don't turn off screen !)
