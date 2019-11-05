# MyESP
General framework for ESP8266/ESP32 with Web,WiFi,MQTT,MDNS,Telnet,Crash detection,Logging

## install & setup

* download and install NodeJS from https://nodejs.org/en/download/ 
* in both the wsemulator and webfilesbuilder folders do `npm ci`

## build web files manually

```sh
cd webfilesbuilder
gulp
```

## run test server with chrome

```sh
cd wsemulator
run.sh or run.bat
```

use password 'neo'

can also use with VSC using the Chrome debugger

## testing websockets

```sh
npm install -g wscat
wscat -c ws://localhost
```
use for example: {"command":"status"}

# js lint

`npm i -g eslint`

