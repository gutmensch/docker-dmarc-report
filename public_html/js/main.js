/* global Promise */

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

function getUrlParam(param) {
    var url = new URL(window.location.href);
    return url.searchParams.get(param);
}

function queryRaumserver(url) {
    // for params as hash
    //var paramString = "?" + Object.keys(params).map(function (prop) {
    //    return [prop, params[prop]].map(encodeURIComponent).join("=");
    //}).join("&");
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    result = JSON.parse(xhr.responseText);
                    console.log(result);
                    return result;
                } catch (e) {
                    console.log("Raumserver answer could not be parsed!");
                }
            }
            // XXX: no http status code for some requests?!
            //else {
            //    console.log("Querying raumserver failed!");
            //}
        }
    };
    xhr.send();
}


function tableEntry(name, id, online, roomZoneId, currentZoneId, event) {
    online_icon = online ? "fa-check-circle-o" : "fa-circle-o";
    toggle_zone_icon = (roomZoneId === currentZoneId) ? "fa-toggle-on" : "fa-toggle-off";

    var tr = document.createElement("tr");
    var td_title = document.createElement("td");
    td_title.className = "ui-btn-text";
    td_title.innerHTML = "<button style=\"font-size:24px\">" + name + "</button>";
    tr.appendChild(td_title);
    var td_online = document.createElement("td");
    td_online.className = "ui-btn-text";
    td_online.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa " + online_icon + "\"></i></button>";
    tr.appendChild(td_online);
    var td_toggle_zone = document.createElement("td");
    td_toggle_zone.className = "ui-btn-text";
    td_toggle_zone.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa " + toggle_zone_icon + "\"></i></button>";
    tr.appendChild(td_toggle_zone);
    var td_status = document.createElement("td");
    td_status.className = "ui-btn-text";
    td_status.innerHTML = "foobar";
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
    //li.setAttribute("id", udn);

    var li_div_btn = document.createElement("div");
    li_div_btn.className = "ui-btn-inner ui-li";

    var li_div_btn_txt = document.createElement("div");
    li_div_btn_txt.className = "ui-btn-text";

    var li_span_arrow = document.createElement("span");
    li_span_arrow.className = "ui-icon ui-icon-arrow-r ui-icon-shadow";

    var link_a = document.createElement("a");
    link_a.className = "ui-link-inherit";

    var txt = document.createTextNode(name);
    
    var paramString = '?id=' + encodeURIComponent(zoneId) + '&value=' + encodeURIComponent(source);
    console.log("paramString: " + paramString);
    var paramString1 = '?id=' + encodeURIComponent(zoneId);
    console.log("paramString: " + paramString1);
    link_a.href = "javascript:queryRaumserver('/raumserver/controller/load" + type + paramString + "');setTimeout(function(){queryRaumserver('/raumserver/controller/play" + paramString1 + "')},3000);";

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

    queryRaumserver:function(request) {
        var promise = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/raumserver' + request, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            reject(xhr.status);
                            console.log("Raumserver answer could not be parsed!");
                        }
                    } else {
                        reject(xhr.status);
                        console.log("Querying raumserver failed!");
                    }
                }
            };
            xhr.send();
        });
        return promise;
    },

    initialize:function() {
        // Handle back button throughout the application
        $('.back').live('click', function (event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
    },
    
    repeat: (ms, func) => new Promise(
        r => (
            setInterval(func, ms),
            new Promise(
                q => setTimeout(r, ms)
            ).then(r)
        )
    ),

    home:function() {
        this.changePage(new HomeView());
        this.updatePlayer();

        this.queryRaumserver('/data/getZoneConfig')
        .then(this.updateHome)
        .catch(error => console.log(error));

        //this.repeat(5000, () => Promise.all([this.queryRaumserver('/data/getZoneConfig')])
        //        .then(this.updateZones)
        //        .catch(error => console.log(error))
        //);
        // polling of zones and rooms
        this.repeat(5000, () => new Promise(
                () => this.queryRaumserver('/data/getZoneConfig')
                .then(this.updateHome)
                .catch(error => console.log(error)))
        );
    },

    zone:function() {
        this.changePage(new ZoneView());
        
        this.updatePlayer();
        
        this.queryRaumserver('/data/getZoneConfig')
        .then(this.updateZoneRoomConfig)
        .catch(error => console.log(error));

        //this.repeat(2000, () => new Promise(
        //        () => this.queryRaumserver('/data/getZoneConfig')
        //        .then(this.updateZoneRoomConfig)
        //        .catch(error => console.log(error)))
        //);
    },

    room:function() {
        this.changePage(new RoomView());
    },

    updateZone:function(zoneData) {
        var zoneId = getUrlParam("id");
        
        // update room list if applicable
        var roomList = document.getElementById("roomlist");
        var currentRooms = Array.from(roomList.children);
        for (var i = 0; i < zoneData.length; i++) {
            for (var j = 0; j < zoneData[i]["rooms"].length; j++) {
                var found = false;
                currentRooms.forEach(function (listedRoom) {
                    if (listedRoom.id === zoneData[i]["rooms"][j]["UDN"])
                        found = true;
                });
                if (!found) {
                    var pos = (i === 0 && j === 0) ? "start" : (i === (zoneData.length - 1) && j === (zoneData[i]["rooms"].length - 1) ? "end" : "none");
                    li = listEntry(
                            zoneData[i]["rooms"][j]["name"],
                            zoneData[i]["rooms"][j]["UDN"],
                            pos, 
                            "?id=" + encodeURIComponent(zoneData[i]["rooms"][j]["UDN"]) + "#room"
                        );
                    roomList.appendChild(li);
                }
            }
        }  
    },
    
    updateZoneRoomConfig:function(zoneData) {
        var zoneId = getUrlParam("id");
        var sourceList = document.getElementById("zone_source_list");
        var sources = [
            { "type": "Uri", "name": "MPD", "value": "http://qnap:8800" },
            { "type": "Playlist", "name": "The Blitz", "value": "TheBlitz" },
            { "type": "Uri", "name": "Rock Antenne Alternative", "value": "http://mp3channels.webradio.rockantenne.de/alternative" },
            { "type": "Uri", "name": "StarFM", "value": "http://85.25.209.152:80/berlin.mp3" },
            { "type": "Uri", "name": "Berliner Rundfunk", "value": "http://stream.berliner-rundfunk.de/brf/mp3-128/internetradio" }            
        ];
        
        sources.forEach(function(source, i) {
            var pos = (0 === (sources.length - 1)) ? "single" : ((i === 0) ? "start" : (i === (sources.length - 1) ? "end" : "none"));
            li = sourceListEntry(
                source["name"],
                source["type"],
                source["value"],
                pos,
                zoneId
            );
            sourceList.appendChild(li);
        });
       
        // update room list if applicable
        var roomList = document.getElementById("zone_room_list");
        
        var currentRooms = Array.from(roomList.children);
        var allRooms = new Array();
        
        for (var i = 0; i < zoneData.length; i++) {
            for (var j = 0; j < zoneData[i]["rooms"].length; j++) {
                var room = zoneData[i]["rooms"][j];
                room["zoneName"] = zoneData[i]["name"] !== "" ? zoneData[i]["name"] : "none";
                room["zoneUDN"] = zoneData[i]["UDN"] !== "" ? zoneData[i]["UDN"] : "none";
                allRooms.push(room);
            }
        }
        
        allRooms.forEach(function(room){
            var found = false;
            currentRooms.forEach(function(listedRoom) {
                if (listedRoom.id === room["UDN"])
                    found = true;
            });
            if (!found) {
                entry = tableEntry(room["name"], room["UDN"], room["online"], room["zoneUDN"], zoneId, "foobarEvent");
                roomList.appendChild(entry);
            }
        });
    },
    
    updateHome:function(zoneData) {
        // update room list if applicable
        var roomList = document.getElementById("home_room_list");
        var currentRooms = Array.from(roomList.children);
        for (var i = 0; i < zoneData.length; i++) {
            for (var j = 0; j < zoneData[i]["rooms"].length; j++) {
                var found = false;
                currentRooms.forEach(function (listedRoom) {
                    if (listedRoom.id === zoneData[i]["rooms"][j]["UDN"])
                        found = true;
                });
                if (!found) {
                    var pos = (i === 0 && j === 0) ? "start" : (i === (zoneData.length - 1) && j === (zoneData[i]["rooms"].length - 1) ? "end" : "none");
                    li = listEntry(
                            zoneData[i]["rooms"][j]["name"],
                            zoneData[i]["rooms"][j]["UDN"],
                            pos,
                            "?id=" + encodeURIComponent(zoneData[i]["rooms"][j]["UDN"]) + "#room"
                        );
                    roomList.appendChild(li);
                }
            }
        }

        // delete zones with empty names due to no zone
        for (var i = 0; i < zoneData.length; i++)
            if (zoneData[i].name === "")
                zoneData.splice(i, 1);

        // update zone list if applicable
        var zoneList = document.getElementById("home_zone_list");
        var currentZones = Array.from(zoneList.children);
        for (var i = 0; i < zoneData.length; i++) {
            var found = false;
            currentZones.forEach(function (listedZone) {
                if (listedZone.id === zoneData[i]["UDN"])
                    found = true;
            });
            if (!found) {
                var pos = (0 === (zoneData.length - 1)) ? "single" : ((i === 0) ? "start" : (i === (zoneData.length - 1) ? "end" : "none"));
                li = listEntry(
                    zoneData[i]["name"],
                    zoneData[i]["UDN"],
                    pos,
                    "?id=" + encodeURIComponent(zoneData[i]["UDN"]) + "#zone"
                );
                zoneList.appendChild(li);
            }
        }
    },

    updatePlayer: function () {
        var player = document.getElementById("player_control");
        var player_row = document.createElement("tr");
        player.appendChild(player_row);

        // http://fontawesome.io/cheatsheet/
        var player_col_back = document.createElement("td");
        player_col_back.className = "ui-btn-text";
        player_col_back.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-backward\"></i></button>";
        player_row.appendChild(player_col_back);

        var player_col_play = document.createElement("td");
        player_col_play.className = "ui-btn-text";
        player_col_play.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-play\"></i></button>";
        player_row.appendChild(player_col_play);

        var player_col_paus = document.createElement("td");
        player_col_paus.className = "ui-btn-text";
        player_col_paus.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-pause\"></i></button>";
        player_row.appendChild(player_col_paus);

        var player_col_forw = document.createElement("td");
        player_col_forw.className = "ui-btn-text";
        player_col_forw.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-forward\"></i></button>";
        player_row.appendChild(player_col_forw);

        var player_col_stop = document.createElement("td");
        player_col_stop.className = "ui-btn-text";
        player_col_stop.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-stop\"></i></button>";
        player_row.appendChild(player_col_stop);

        var player_col_rept = document.createElement("td");
        player_col_rept.className = "ui-btn-text";
        player_col_rept.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-repeat\"></i></button>";
        player_row.appendChild(player_col_rept);

        var player_col_vold = document.createElement("td");
        player_col_vold.className = "ui-btn-text";
        player_col_vold.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-volume-down\"></i></button>";
        player_row.appendChild(player_col_vold);

        var player_col_volu = document.createElement("td");
        player_col_volu.className = "ui-btn-text";
        player_col_volu.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-volume-up\"></i></button>";
        player_row.appendChild(player_col_volu);

        var player_col_volo = document.createElement("td");
        player_col_volo.className = "ui-btn-text";
        player_col_volo.innerHTML = "<button style=\"font-size:24px\"><i class=\"fa fa-volume-off\"></i></button>";
        player_row.appendChild(player_col_volo);
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