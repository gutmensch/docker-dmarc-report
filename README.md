# docker-raumserver [![Docker Pulls](https://img.shields.io/docker/pulls/gutmensch/raumserver.svg)](https://registry.hub.docker.com/u/gutmensch/raumserver/)

Raumserver is a HTTP REST API daemon for RF devices created by ChriD (see https://github.com/ChriD/Raumserver). It can be installed on RF devices itself or in the same network with communication via UPnP.

Current version: 1.0.2 (11.02.2017)

## Usage
```
docker pull gutmensch/raumserver
docker run --net=host -ti gutmensch/raumserver start.sh
```

## WebClient
This image now features a simple AJAX webclient. By default it should be available after running the image at http://docker:3535/. The Quick Source menu is not yet dynamic. Take a look at the top of main.js, if you want to rebuild - Playlists and HTTP Streams are supported, I didn't get containers to work (see loadContainer in the raumserver documentation). The client's interface was designed to be as suitable for smartphones/tablets as possible, therefor some constraints with regards to line length etc. pp.
<img src="https://github.com/gutmensch/docker-raumserver/raw/master/images/screenshot.png" width="200" />

## Raumserver version and zone config
```
$ curl docker:3535/raumserver/data/getVersion | python -mjson.tool
{
    "raumkernelLib": "1.0.2",
    "raumserverLib": "1.0.2"
}
$ curl docker:3535/raumserver/data/getZoneConfig | python -mjson.tool
[
    {
        "UDN": "uuid:92A8D729-D665-4D13-8E63-B0994E4BDB84",
        "name": "Bad, Kueche",
        "rooms": [
            {
                "UDN": "uuid:cddc2453-8f96-4ece-9c9e-791212003367",
                "color": "#CC0000",
                "name": "Bad",
                "online": true
            },
            {
                "UDN": "uuid:d6b7fbad-b9bc-4bc2-add3-49c3104e0b80",
                "color": "#CC0000",
                "name": "Kueche",
                "online": true
            }
        ]
    },
    {
        "UDN": "",
        "name": "",
        "rooms": []
    }
]
```

## Command reference
https://github.com/ChriD/Raumserver/wiki/Available-control-and-data-requests
