/*
 * Object and functions related to raumserver (client)
 */
window.raumfeld = new Object();
window.raumfeld.raumserver = '/raumserver';
window.raumfeld.zones = [];
window.raumfeld.rooms = [];
window.raumfeld.sources = [
    {"type": "Uri", "name": "MPD", "value": "http://qnap:8800"},
    {"type": "Playlist", "name": "The Blitz", "value": "TheBlitz"},
    {"type": "Uri", "name": "Rock Antenne Alternative", "value": "http://mp3channels.webradio.rockantenne.de/alternative"},
    {"type": "Uri", "name": "StarFM", "value": "http://85.25.209.152:80/berlin.mp3"},
    {"type": "Uri", "name": "Berliner Rundfunk", "value": "http://stream.berliner-rundfunk.de/brf/mp3-128/internetradio"}
];

function getUrlParam(param) {
    var url = new URL(window.location.href);
    return decodeURIComponent(url.searchParams.get(param));
}

function getZoneName(zoneId) {
    var name = "n/a";
    window.raumfeld.zones.forEach(function(zone){
       if (zone["UDN"] === zoneId)
           name = zone["name"];
    });
    return name;
}

function getRaumfeldZoneStatus() {
    return queryRaumserver('/data/getZoneConfig', {}, false);
}

function getRaumfeldRendererStatus() {
    return queryRaumserver('/data/getRendererState', { listAll: true }, false);
}

function updateRaumfeldZoneStatus(zoneData) {
    if (Array.isArray(zoneData)) {
        // extract rooms
        zoneData.forEach(function(zone) {
            zone["rooms"].forEach(function(newRoom) {
                var alreadyFound = false;
                window.raumfeld.rooms.forEach(function(activeRoom) {
                    alreadyFound = activeRoom["UDN"] === newRoom["UDN"] ? true : alreadyFound;
                });
                if (!alreadyFound) {
                    newRoom["zoneUDN"] = zone["UDN"] !== "" ? zone["UDN"] : "none";
                    newRoom["zoneName"] = zone["name"] !== "" ? zone["name"] : "none";
                    window.raumfeld.rooms.push(newRoom);
                }
            });
        });
        // delete zones with empty names due to no zone
        zoneData.forEach(function(zone, i) {
            if (zone["name"] === "")
                zoneData.splice(i, 1);
        });
        window.raumfeld.zones = zoneData;
    }
}

function updateRaumfeldRendererStatus(rendererData) {
    if (Array.isArray(rendererData)) {
        // for sake of simplicity we just add missing values to zones and roomsa
        // each room and zone should match values from the global vars
        // window.raumfeld.zones and window.raumfeld.rooms
        rendererData.forEach(function(renderer) {
            renderer["roomStates"].forEach(function(newRoom) {
                window.raumfeld.rooms.forEach(function(activeRoom) {
                    if (activeRoom["UDN"] === newRoom["roomUdn"]) {
                        activeRoom["isMute"] = newRoom["isMute"];
                        activeRoom["isOnline"] = newRoom["isOnline"];
                        activeRoom["transportState"] = newRoom["transportState"];
                        activeRoom["volume"] = newRoom["volume"];
                    }
                });
            });
            window.raumfeld.zones.forEach(function(activeZone) {
                if (activeZone["UDN"] === renderer["udn"]) {
                    Object.keys(renderer).forEach(function (key){
                        if (!activeZone.hasOwnProperty(key)) {
                            activeZone[key] = renderer[key];
                        }
                    });
                }
            });
        });
    }
}

function updateTitle(id, msg) {
    if (document.getElementById(id)) {
        document.getElementById(id).innerHTML =
            '<a href="#" data-icon="back" class="back ui-btn-left ui-btn ui-btn-up-a ui-btn-icon-left ui-btn-corner-all ui-shadow" data-theme="a"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Back</span><span class="ui-icon ui-icon-back ui-icon-shadow"></span></span></a>'+
            '<h1 class="ui-title" tabindex="0" role="heading" aria-level="1">'+msg+'</h1>';
    }
}

function queryRaumserver(uri, params, longPolling = false) {
    var paramString = "?" + Object.keys(params).map(function (prop) {
        return [prop, params[prop]].map(encodeURIComponent).join("=");
    }).join("&");

    var promise = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 2000;
        xhr.open('GET', window.raumfeld.raumserver + uri + paramString, true);
        xhr.ontimeout = function () {
            updateTitle('home_title_status', 'Raumserver App (timeout)');
            updateTitle('zone_title_status', 'Zone (timeout)');
            updateTitle('room_title_status', 'Room (timeout)');
            reject();
        };
        xhr.onerror = function() {
            //updateTitle('home_title_status', 'Raumserver App (disconnected)');
            //updateTitle('zone_title_status', 'Zone (disconnected)');
            //updateTitle('room_title_status', 'Room (disconnected)');
            //reject();
        };
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                // XXX: bug in raumserver for some requests no HTTP status returned
                // this also leads to Browser JavaScript errors (invalid http response
                // and JSON parse exception. However, the request still succeeds on the
                // server! :-/
                //if (xhr.status === 200) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    console.log("Raumserver answer could not be parsed!");
                    resolve(e);
                }
                //} else {
                //    reject(xhr.status);
                //    console.log("Querying raumserver failed!");
                //}
            }
        };
        xhr.send();
    });
    return promise;
}

function repeat(ms, func) {
    new Promise(
        r => (
            setInterval(func, ms),
            new Promise(
                q => setTimeout(r, ms)
            ).then(r)
        )
    )
}


/*
 * Webapp related objects, helper functions and router
 */
window.HomeView = Backbone.View.extend({

    template: _.template($('#home').html()),

    render: function (eventName) {
        $(this.el).html(this.template());

        return this;
    }

});

window.ZoneView = Backbone.View.extend({

    template: _.template($('#zone').html()),

    render: function (eventName) {
        $(this.el).html(this.template());

        return this;
    }
});

window.RoomView = Backbone.View.extend({

    template: _.template($('#room').html()),

    render: function (eventName) {
        $(this.el).html(this.template());

        return this;
    }
});

function tableHeadRow(className) {
    head = document.createElement("thead");
    head.classname = className;
    row = document.createElement("tr");
    row.className = className;

    row.appendChild(tableHead('zone-room-list', 'Name'));
    row.appendChild(tableHead('zone-room-list', 'On'));
    row.appendChild(tableHead('zone-room-list', 'Zone'));
    row.appendChild(tableHead('zone-room-list', 'Mute'));
    row.appendChild(tableHead('zone-room-list', 'Status'));

    head.appendChild(row);

    return head;
}

function tableHead(className, title) {
    th = document.createElement("th");
    th.className = className;
    th.innerHTML = title;
    return th;
}

function tableEntry(name, id, online, roomZoneId, isMute, transportState = "n/a", currentZoneId, event) {
    online_icon = online ? "fa-check-circle-o" : "fa-circle-o";
    toggle_zone_icon = (roomZoneId === currentZoneId) ? "fa-toggle-on" : "fa-toggle-off";

    var tr = document.createElement("tr");
    tr.className = "zone-room-list";
    tr.id = id;

    var td_title = document.createElement("td");
    td_title.className = "ui-btn-text zone-room-list";
    td_title.innerHTML = name;
    tr.appendChild(td_title);
    var td_online = document.createElement("td");
    td_online.className = "ui-btn-text zone-room-list";
    td_online.innerHTML = "<i class=\"fa " + online_icon + "\"></i>";
    tr.appendChild(td_online);
    var td_toggle_zone = document.createElement("td");
    td_toggle_zone.className = "ui-btn-text zone-room-list";
    td_toggle_zone.innerHTML = "<button style=\"font-size:110%\"><i class=\"fa " + toggle_zone_icon + "\"></i></button>";
    tr.appendChild(td_toggle_zone);
    var td_toggle_mute = document.createElement("td");
    td_toggle_mute.className = "ui-btn-text zone-room-list";
    td_toggle_mute.innerHTML = "<button style=\"font-size:110%\"><i onclick="+event+" class=\"fa fa-volume-off\"></i></button>";
    tr.appendChild(td_toggle_mute);
    var td_status = document.createElement("td");
    td_status.className = "ui-btn-text zone-room-list zone-room-list-status";
    td_status.innerHTML = transportState.toLowerCase();
    tr.appendChild(td_status);
    return tr;
}

function listEntry(name, udn, placement, link) {

    var li = document.createElement("li");
    var li_init_css_class = "ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-btn-up-c";
    var li_css_class = "ui-btn ui-btn-icon-right ui-li-has-arrow ui-li";
    switch (placement) {
        case "start":
            li_init_css_class += " ui-corner-top";
            li_css_class += " ui-corner-top";
            break;
        case "end":
            li_init_css_class += " ui-corner-bottom";
            li_css_class += " ui-corner-bottom";
            break;
        case "single":
            li_init_css_class += " ui-corner-top ui-corner-bottom";
            li_css_class += " ui-corner-top ui-corner-bottom";
            break;
        default:
            ;
    }

    li.onmouseover = function () {
        li.className = li_css_class + " ui-btn-hover-c";
    };
    li.onmouseout = function () {
        li.className = li_css_class + " ui-btn-up-c";
    };

    li.className = li_init_css_class;
    li.setAttribute("data-theme", "c");
    li.setAttribute("id", udn);

    var li_div_btn = document.createElement("div");
    li_div_btn.className = "ui-btn-inner ui-li";
    var li_div_btn_txt = document.createElement("div");
    li_div_btn_txt.className = "ui-btn-text";
    var li_span_arrow = document.createElement("span");
    li_span_arrow.className = "ui-icon ui-icon-arrow-r ui-icon-shadow";
    var link_a = document.createElement("a");
    link_a.className = "ui-link-inherit";
    var txt = document.createTextNode(name);
    link_a.href = link;

    link_a.appendChild(txt);
    li_div_btn_txt.appendChild(link_a);
    li_div_btn.appendChild(li_div_btn_txt);
    li_div_btn.appendChild(li_span_arrow);
    li.appendChild(li_div_btn);

    return li;
}

function playerButton(awesomeIcon, raumfeldAction, raumfeldValues = {}) {
    var button = document.createElement("td");
    button.className = "ui-btn-text";
    var button_style = document.createElement("button");
    button_style.setAttribute("style", "font-size:108%");
    var button_icon = document.createElement("i");
    button_icon.className = "fa " + awesomeIcon;
    button_icon.setAttribute("onclick","javascript:queryRaumserver('/controller/"+raumfeldAction+"',"+ JSON.stringify(raumfeldValues) +")");
    button_style.appendChild(button_icon);
    button.appendChild(button_style);
    return button;
}

function sourceListEntry(name, type, source, placement, zoneId) {

    var li = document.createElement("li");
    var li_init_css_class = "ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-btn-up-c";
    var li_css_class = "ui-btn ui-btn-icon-right ui-li-has-arrow ui-li";
    switch (placement) {
        case "start":
            li_init_css_class += " ui-corner-top";
            li_css_class += " ui-corner-top";
            break;
        case "end":
            li_init_css_class += " ui-corner-bottom";
            li_css_class += " ui-corner-bottom";
            break;
        case "single":
            li_init_css_class += " ui-corner-top ui-corner-bottom";
            li_css_class += " ui-corner-top ui-corner-bottom";
            break;
        default:
            ;
    }

    li.onmouseover = function () {
        li.className = li_css_class + " ui-btn-hover-c";
    };
    li.onmouseout = function () {
        li.className = li_css_class + " ui-btn-up-c";
    };

    li.className = li_init_css_class;
    li.setAttribute("data-theme", "c");
    li.name = name;

    var li_div_btn = document.createElement("div");
    li_div_btn.className = "ui-btn-inner ui-li";
    var li_div_btn_txt = document.createElement("div");
    li_div_btn_txt.className = "ui-btn-text";
    var li_span_arrow = document.createElement("span");
    li_span_arrow.className = "ui-icon ui-icon-arrow-r ui-icon-shadow";
    var link_a = document.createElement("a");
    link_a.className = "ui-link-inherit";
    var txt = document.createTextNode(name);
    
    var paramsLoad = {
      id: zoneId,
      value: source
    };
    var paramsPlay = {
      id: zoneId
    };
    link_a.href = "javascript:queryRaumserver('/controller/load" + type + "',"+ JSON.stringify(paramsLoad) +");setTimeout(function(){queryRaumserver('/controller/play'," + JSON.stringify(paramsPlay) + ")},3000);";

    link_a.appendChild(txt);
    li_div_btn_txt.appendChild(link_a);
    li_div_btn.appendChild(li_div_btn_txt);
    li_div_btn.appendChild(li_span_arrow);
    li.appendChild(li_div_btn);

    return li;
}

var AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "zone": "zone",
        "room": "room"
    },

    initialize:function() {
        // Handle back button throughout the application
        $('.back').live('click', function (event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
    },

    update:function(func) {
        getRaumfeldZoneStatus()
        .then(updateRaumfeldZoneStatus)
        .then(func);

        repeat(5000, () => new Promise(
                () => getRaumfeldZoneStatus()
                .then(updateRaumfeldZoneStatus)
                .then(func))
        );

        // update raumfeld renderer states periodically
        getRaumfeldRendererStatus()
        .then(updateRaumfeldRendererStatus)
        .then(func);

        repeat(5000, () => new Promise(
                () => getRaumfeldRendererStatus()
                .then(updateRaumfeldRendererStatus)
                .then(func))
        );
    },

    home:function() {
        this.changePage(new HomeView());
        this.update(this.updateHome);
    },

    zone:function() {
        this.changePage(new ZoneView());
        this.updatePlayer();
        this.update(this.updateZone);
    },

    room:function() {
        this.changePage(new RoomView());
    },

    updateHome:function() {
        var raumfeldZones = window.raumfeld.zones;
        var raumfeldRooms = window.raumfeld.rooms;

        // update room list if applicable
        var roomList = document.getElementById("home_room_list");
        var currentRooms = Array.from(roomList.children);

        raumfeldRooms.forEach(function(room, i){
            var found = false;
            currentRooms.forEach(function(listedRoom) {
                found = listedRoom.id === room["UDN"] ? true : found;
            });
            if (!found) {
                var pos = (0 === (raumfeldRooms.length - 1)) ? "single" : ((i === 0) ? "start" : (i === (raumfeldRooms.length - 1) ? "end" : "none"));
                li = listEntry(room["name"], room["UDN"], pos, "?id=" + encodeURIComponent(room["UDN"]) + "#room");
                roomList.appendChild(li);
            }
        });

        // update zone list if applicable
        var zoneList = document.getElementById("home_zone_list");
        var currentZones = Array.from(zoneList.children);

        raumfeldZones.forEach(function(zone, i){
            var found = false;
            currentZones.forEach(function (listedZone) {
                found = listedZone.id === zone["UDN"] ? true : found;
            });
            if (!found) {
                var pos = (0 === (raumfeldZones.length - 1)) ? "single" : ((i === 0) ? "start" : (i === (raumfeldZones.length - 1) ? "end" : "none"));
                li = listEntry(zone["name"], zone["UDN"], pos, "?id=" + encodeURIComponent(zone["UDN"]) + "#zone");
                zoneList.appendChild(li);
            }
        });
    },

   updateZone:function() {
        var zoneId = getUrlParam("id");
        var raumfeldRooms = window.raumfeld.rooms;
        var sources = window.raumfeld.sources;

        var sourceList = document.getElementById("zone_source_list");
        var currentSources = Array.from(sourceList.children);

        sources.forEach(function(source, i) {
            var found = false;
            currentSources.forEach(function(listedSource) {
                found = listedSource.name === source["name"] ? true : found;
            });
            if (!found) {
                var pos = (0 === (sources.length - 1)) ? "single" : ((i === 0) ? "start" : (i === (sources.length - 1) ? "end" : "none"));
                li = sourceListEntry(source["name"], source["type"], source["value"], pos, zoneId);
                sourceList.appendChild(li);
            }
        });

        // update room list if applicable
        var roomList = document.getElementById("zone_room_list");
        var currentRooms = Array.from(roomList.children);

        // XXX: need smarter update function here...
        roomList.innerHTML = "";
        roomList.appendChild(tableHeadRow('zone-room-list-head'));
        tbody = document.createElement("tbody");
        roomList.appendChild(tbody);
        raumfeldRooms.forEach(function(room){
            var found = false;
            currentRooms.forEach(function(listedRoom) {
                found = listedRoom.id === room["UDN"] ? true : found;
            });
            //if (!found) {
                var params = {
                    id: room["UDN"]
                };
                entry = tableEntry(
                    room["name"],
                    room["UDN"],
                    room["online"],
                    room["zoneUDN"],
                    room["isMute"],
                    room["transportState"],
                    zoneId,
                    "javascript:queryRaumserver('/controller/toggleMute'," + JSON.stringify(params) + ")"
                );
                tbody.appendChild(entry);
            //}
        });

        updateTitle('zone_title_status', 'Zone: ' + getZoneName(zoneId));
    },

    updatePlayer: function() {
        var player = document.getElementById("player_control");
        var player_row = document.createElement("tr");
        var volume_row = document.createElement("tr");
        player.appendChild(player_row);
        player.appendChild(volume_row);
        player_row.appendChild(playerButton('fa-backward','prev',{id: getUrlParam('id')}));
        player_row.appendChild(playerButton('fa-play','play',{id: getUrlParam('id')}));
        player_row.appendChild(playerButton('fa-pause','pause',{id: getUrlParam('id')}));
        player_row.appendChild(playerButton('fa-forward','next',{id: getUrlParam('id')}));
        player_row.appendChild(playerButton('fa-stop','stop',{id: getUrlParam('id')}));
        player_row.appendChild(playerButton('fa-repeat','setPlayMode',{id: getUrlParam('id'), mode:'REPEAT_ALL'}));
        volume_row.appendChild(playerButton('fa-volume-down','volumeDown',{id: getUrlParam('id'), scope:'zone', value:'2'}));
        volume_row.appendChild(playerButton('fa-volume-up','volumeUp',{id: getUrlParam('id'), scope:'zone', value:'2'}));
        volume_row.appendChild(playerButton('fa-volume-off','toggleMute',{id: getUrlParam('id'), scope:'zone'}));
    },

    changePage: function (page) {
        $(page.el).attr('data-role', 'page');
        page.render();
        $('body').append($(page.el));
        var transition = $.mobile.defaultPageTransition;
        // We don't want to slide the first page
        if (this.firstPage) {
            transition = 'none';
            this.firstPage = false;
        }
        $.mobile.changePage($(page.el), {changeHash: false, transition: transition});
    }

});

$(document).ready(function () {
    console.log('document ready');
    app = new AppRouter();
    Backbone.history.start();
});
