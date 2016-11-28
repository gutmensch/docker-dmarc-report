FROM ubuntu:14.04

MAINTAINER Robert Schumann <gutmensch@n-os.org>

ENV APPDIR `pwd`/raumserver

RUN apt-get update && apt-get install -y git wget unzip

RUN wget http://bassmaniacs.com/data/appBinaries/raumserver/currentVersion/raumserverDaemon_linux_X64.zip \
      && unzip raumserverDaemon_linux_X64.zip -d $APPDIR \
      && mkdir -p /etc/raumfeld/raumserverDaemon \
      && ln -s $APPDIR/docroot /etc/raumfeld/raumserverDaemon/docroot

EXPOSE 8080

CMD ["${APPDIR}/raumsrvDaemon"]

