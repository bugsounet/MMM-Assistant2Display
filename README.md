# MMM-Assistant2Display

This module is an addons for MMM-AssistantMk2.

It allows to display the links, photos and YouTube video found by your assistant.

You can control MagicMirror sound volume, screen, detector, pir sensor, and more

Needed: AMk2 v3.2.0 and more

## Screenshoot

 ![](https://raw.githubusercontent.com/bugsounet/MMM-Assistant2Display/dev/screenshoot2.jpeg)
 ![](https://raw.githubusercontent.com/bugsounet/MMM-Assistant2Display/dev/screenshoot1.jpg)
 ![](https://raw.githubusercontent.com/bugsounet/MMM-Assistant2Display/dev/YouTube_Cast.png)

## Update history


 * 30/04/2020 (v1.4.0)
   * **ADD**: Youtube Cast
   * **FIX**: Minor error
   * **ADD**: Integred AMk2 Snowboy detect code
   * **FIX**: Radio volume too high compared to assistant
   * **CLN**: Cleaning package.json
 * 16/04/2020 (v1.3.0)
   * **ADD**: Radio player core
   * **DEL**: Link Proxy script
   * **ADD**: Use now webview for links displaying
   * **ADD**: TelegramBot Commands
   * **ADD**: scrollActivate feature
   * **ADD**: Telecast sound on incoming message
 * 09/04/2020 (v1.2.0)
   * **FIX**: A2D core code for new features
   * **ADD**: Screen feature
   * **ADD**: PIR Sensor feature
   * **ADD**: Internet check feature
   * **ADD**: Governor feature
   * **ADD**: Brief Today feature
   * **ADD**: Detector control

## Installation

```sh
cd ~/MagicMirror/modules
git clone https://github.com/bugsounet/MMM-Assistant2Display.git
cd MMM-Assistant2Display
npm install
```

## Configuration
Read the docs in [wiki](https://github.com/bugsounet/MMM-Assistant2Display/wiki)

## Update from 1.1
Remove existence then reinstall fresh.

### Update History
 * 22/03/2020 (V1.1.1)
   * **FIX**: Always screen up when YT display and assistant query
   * **FIX**: Always screen up when on next playlist YT
 * 19/03/2020 (V1.1.0)
   * **ADD**: YouTube support with all AMk2 ui
   * **ADD**: Title display in Classic / Classic2 ui (beta)
   * **ADD**: vocal sound control
   * **ADD**: screen addon control (screen addon v1.0.4 needed)
   * **ADD**: feature activation sub modules choice 

## Last Tested
- MagicMirror : 2.11.0
- RPI 3B+ / raspbian 10 / nodeJS v10.x / npm 6.x
- debian 10 / nodeJS v10.19.0 / npm v6.14.1

## Credits
- Author :
  - @bugsounet
  - @eouia
- License : MIT
  - **By terms of Google Assistant SDK, You are not allowed to use or provide this module for commercial purpose.**
