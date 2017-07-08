# docker-raumserver [![Docker Pulls](https://img.shields.io/docker/pulls/gutmensch/raumserver.svg)](https://registry.hub.docker.com/u/gutmensch/raumserver/)

Raumserver is a HTTP REST API daemon for RF devices created by ChriD (see https://github.com/ChriD/Raumserver). It can be installed on RF devices itself or in the same network with communication via UPnP.

Current version: 1.0.2 (11.02.2017)

## Usage
```
docker pull gutmensch/raumserver
docker run --net=host -ti gutmensch/raumserver start.sh
```

## Version and zone config
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
