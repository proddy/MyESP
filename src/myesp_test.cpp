/*
 * MyESP test
 */

#include "MyESP.h"
#include "version.h"

// default APP params
#define APP_NAME "myesp"
#define APP_HOSTNAME "myesp"
#define APP_URL "https://github.com/proddy/EMS-ESP"
#define APP_URL_API "https://api.github.com/repos/proddy/EMS-ESP"

#define myDebug(...) myESP.myDebug(__VA_ARGS__)
#define myDebug_P(...) myESP.myDebug_P(__VA_ARGS__)


// global params
uint16_t _ledpin;

command_t project_cmds[] = {

    {false, "info", "show info"},
    {true, "ledpin [n]", "led pin setting"}

};

// print settings and commands
void _showCommands(uint8_t event) {
    bool      mode = (event == TELNET_EVENT_SHOWSET); // show set commands or normal commands
    command_t cmd;

    // find the longest key length so we can right-align the text
    uint8_t max_len = 0;
    uint8_t i;
    for (i = 0; i < ArraySize(project_cmds); i++) {
        memcpy_P(&cmd, &project_cmds[i], sizeof(cmd));
        if ((strlen(cmd.key) > max_len) && (cmd.set == mode)) {
            max_len = strlen(cmd.key);
        }
    }

    char line[200] = {0};
    for (i = 0; i < ArraySize(project_cmds); i++) {
        memcpy_P(&cmd, &project_cmds[i], sizeof(cmd));
        if (cmd.set == mode) {
            if (event == TELNET_EVENT_SHOWSET) {
                strlcpy(line, "  set ", sizeof(line));
            } else {
                strlcpy(line, "*  ", sizeof(line));
            }
            strlcat(line, cmd.key, sizeof(line));
            for (uint8_t j = 0; j < ((max_len + 5) - strlen(cmd.key)); j++) { // account for longest string length
                strlcat(line, " ", sizeof(line));                             // padding
            }
            strlcat(line, cmd.description, sizeof(line));
            myDebug(line); // print the line
        }
    }
}

// call back when a telnet client connects or disconnects
// we set the logging here
void TelnetCallback(uint8_t event) {
    if (event == TELNET_EVENT_CONNECT) {
        // do stuff
    } else if (event == TELNET_EVENT_DISCONNECT) {
        // do stuff
    } else if ((event == TELNET_EVENT_SHOWCMD) || (event == TELNET_EVENT_SHOWSET)) {
        _showCommands(event);
    }
}

// Init callback, which is used to set functions and call methods when telnet has started
void WIFICallback() {
    myDebug("* wifi init callback");
}

// MQTT Callback to handle incoming/outgoing changes
void MQTTCallback(unsigned int type, const char * topic, const char * message) {
    // we're connected. lets subscribe to some topics
    if (type == MQTT_CONNECT_EVENT) {
        myESP.mqttSubscribe("test");

        // subscribe to a start message and send the first publish
        myESP.mqttSubscribe(MQTT_TOPIC_START);
        myESP.mqttPublish(MQTT_TOPIC_START, MQTT_TOPIC_START_PAYLOAD);
    }

    if (type == MQTT_MESSAGE_EVENT) {
        if ((strcmp(topic, "test") == 0)) {
            myDebug("MQTT message %d on topic %s\n", message, topic);
        }
    }
}

// callback for loading/saving settings to the file system (SPIFFS)
bool LoadSaveCallback(MYESP_FSACTION_t action, JsonObject settings) {
    if (action == MYESP_FSACTION_LOAD) {
        // check for valid json
        if (settings.isNull()) {
            myDebug_P(PSTR("Error processing json settings"));
            return false;
        }

        _ledpin = settings["ledpin"];

        return true;
    }

    // save action - here we modify the Json object directly. We get an empty json doc.
    if (action == MYESP_FSACTION_SAVE) {
        settings["ledpin"]  = _ledpin;

        return true;
    }

    return false;
}


// callback for custom settings when showing Stored Settings
// wc is number of arguments after the 'set' command
// returns true if the setting was recognized and changed
bool SetListCallback(MYESP_FSACTION_t action, uint8_t wc, const char * setting, const char * value) {
    bool ok = false;

    if (action == MYESP_FSACTION_SET) {
        if ((strcmp(setting, "ledpin") == 0) && (wc == 2)) {
            _ledpin = atoi(value);
            ok      = true;
        }
    }

    if (action == MYESP_FSACTION_LIST) {
        myDebug("  ledpin=%d", _ledpin);
        ok = true;
    }

    return ok;
}

void showInfo() {
    myDebug("Info...");
    myDebug("Led GPIO pin is %d", _ledpin);
}

// extra commands options for telnet debug window
// wc is the word count, i.e. number of arguments. Everything is in lower case.
void TelnetCommandCallback(uint8_t wc, const char * commandLine) {
    bool ok = false;
    // get first command argument
    char * first_cmd = strtok((char *)commandLine, ", \n");

    if (strcmp(first_cmd, "info") == 0) {
        showInfo();
        ok = true;
    }

    // check for invalid command
    if (!ok) {
        myDebug("Unknown command. Use ? for help.");
    }
}

// web information for diagnostics
void WebCallback(JsonObject root) {
    root["myesp1"] = "myesp test p1";
    root["myesp2"] = "myesp test p2";
}

// OTA callback when the OTA process starts
void OTACallback_pre() {
}

// OTA callback when the OTA process finishes
void OTACallback_post() {
}

/*
 * Setup
 */
void setup() {
    // set up myESP for Wifi, MQTT, MDNS and Telnet callbacks
    myESP.setTelnet(TelnetCommandCallback, TelnetCallback); // set up Telnet commands
    myESP.setWIFI(WIFICallback);                            // wifi callback
    myESP.setMQTT(MQTTCallback);                            // MQTT ip, username and password taken from the SPIFFS settings
    myESP.setSettings(LoadSaveCallback, SetListCallback, false);
    myESP.setWeb(WebCallback);                       // web custom settings
    myESP.setOTA(OTACallback_pre, OTACallback_post); // OTA callback which is called when OTA is starting and stopping

    myESP.begin(APP_HOSTNAME, APP_NAME, APP_VERSION, APP_URL, APP_URL_API);

    myESP.heartbeatPrint();
}

void loop() {
    static unsigned long last = 0;

    myESP.loop();

    if ((millis() - last) > 10000) {
        last = millis();
        myESP.heartbeatPrint();
    }
}