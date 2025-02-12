# docker-dmarc-report ![Docker Build](https://github.com/gutmensch/docker-dmarc-report/actions/workflows/docker-image.yml/badge.svg) [![Docker Pulls](https://img.shields.io/docker/pulls/gutmensch/dmarc-report.svg)](https://registry.hub.docker.com/u/gutmensch/dmarc-report/)

This image is intended to combine a dmarc report parser (see https://github.com/techsneeze/dmarcts-report-parser by TechSneeze.com and John Bieling) with a report viewer (see https://github.com/techsneeze/dmarcts-report-viewer/ by the same people) into a runnable docker image / microservice.

It fetches dmarc report mails regularly from an IMAP server, stores them into a MySQL DB and visualizes them via Webserver/PHP module.

## Howto

1. Create a \_dmarc.example.com TXT DNS record for your domain, containg an IMAP postbox, e.g.

```bash
17:18 $ dig TXT _dmarc.schumann.link +short
"v=DMARC1\; p=quarantine\; fo=1\; rua=mailto:dmarc@schumann.link\; ruf=mailto:dmarc@schumann.link\; adkim=s\; aspf=s\;"
```

1. Create a MySQL Database and a user for this service

1. Run this docker image with below mentioned env vars

1. Access port 80 on the container (or 443) or put it behind a reverse proxy to view reports

```bash
docker pull gutmensch/dmarc-report
docker run -e ... -ti gutmensch/dmarc-report
```

New dmarc reports will be fetched every 15 minutes past the hour, every hour. Therefore it can take up to one hour for the first report to be fetched.

## Versions for last build latest and docker image tag 1.4

dmarcts report viewer: 2024-02-04

dmarcts report parser: 2024-02-04

CAUTION: The old gutmensch/dmarc-report:latest image (older alpine, php5, etc.) is available still as gutmensch/dmarc-report:0.5. The current latest (and 1.0) uses the latest alpine version, newer MySQL client libraries, newer OpenSSL, etc. and improves compatibilitiy with MySQL 8+.

## Frontend Screenshot

![DMARC Report Viewer](https://github.com/gutmensch/docker-dmarc-report/blob/master/screenshot.png?raw=true)

## Sample docker compose / Environment variables

Make sure to create the IMAP-Folders for processed and error reports before the cron job runs!

The default foldernames are are [`error`](examples/env.example) & [`processed`](examples/env.example) but they can be changed within the [`env-file`](examples/env.example).

Make sure to rename the [`env.example`](examples/env.example) file to `.env` and adjust the values to your needs.

You can find templates for both, [`postgreql`](examples/docker-compose.postgres.yml)
 and [`mysql`](examples/docker-compose.mysql.yml)
 db in the [`examples`](examples) directory. Just rename the setup you want to use to `docker-compose.yml`.




## Manual update

If you are using the docker-compose file above, you can use this command to trigger an manual update. It will fetch the latest reports and parse them.

```bash
docker compose exec dmarc-report /usr/bin/dmarcts-report-parser.pl -i -d -r=1
```

## Optional extended configuration

For further optional configuration see the docker-compose [`env-file`](examples/env.example).

## Contributors

<img src="./CONTRIBUTORS.svg">

## Stargazers over time

[![Stargazers over time](https://starchart.cc/gutmensch/docker-dmarc-report.svg)](https://starchart.cc/gutmensch/docker-dmarc-report)
