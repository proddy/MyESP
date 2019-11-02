# MyESP
General framework for ESP8266/ESP32 with Web,WiFi,MQTT,MDNS,Telnet,Crash detection,Logging

## install & setup

* download and install NodeJS from https://nodejs.org/en/download/ 
* `npm install gulp` or for osx `sudo npm install gulp-cli -g`
* `npm install ws` (from https://github.com/websockets/ws)
* reboot and restart PlatformIDE

## build web files

```
cd webfilesbuilder
gulp
```

## run test server with chrome

```
cd wsemulator
node wserver.js
```
or
`run.sh` or `run.bat`

use password 'neo'

can also use with VSC using the Chrome debugger

## testing websockets

```
npm install -g wscat
wscat -c ws://localhost
```
use for example: {"command":"status"}

# js lint

`npm i -g eslint`

