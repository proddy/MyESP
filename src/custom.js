var custom_config = {
    "command": "custom_configfile",
    "settings": {
        "ledpin": 2
    }
}

function custom_commit() {
    websock.send(JSON.stringify(custom_config));
}

function listcustom() {
    document.getElementById("ledpin").value = custom_config.settings.ledpin;
}

function savecustom() {
    custom_config.settings.ledpin = parseInt(document.getElementById("ledpin").value);

    custom_saveconfig();
}

function listCustomStats() {
    document.getElementById("myesp1").innerHTML = ajaxobj.myesp1;
    document.getElementById("myesp2").innerHTML = ajaxobj.myesp2;
}

