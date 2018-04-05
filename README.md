# docker-dmarc-report [![Docker Pulls](https://img.shields.io/docker/pulls/gutmensch/dmarc-report.svg)](https://registry.hub.docker.com/u/gutmensch/dmarc-report/)

This image is intended to combine a dmarc report parser (see https://github.com/techsneeze/dmarcts-report-parser by TechSneeze.com and John Bieling) with a report viewer (see https://github.com/techsneeze/dmarcts-report-viewer/ by the same people) into a runnable docker image / microservice.

It fetches dmarc report mails regularly from an IMAP server, stores them into a MySQL DB and visualizes them via Webserver/PHP module.

## Howto
1. Create a _dmarc.example.com TXT DNS record for your domain, containg a mail address (IMAP postbox)
2. Create a MySQL Database and a user for this service
3. Run this docker image with below mentioned env vars
4. Access port 80 on the container (or 443) or put it behind a reverse proxy to view reports
```
docker pull gutmensch/dmarc-report
docker run -e ... -ti gutmensch/dmarc-report
```

## Versions for last build latest
dmarcts report viewer: 2018-03-31

dmarcts report parser: 2018-03-31

## Sample docker compose / Environment variables
The variables should be self-explanatory. Make sure to create the DB and IMAP folders before the cron job runs!
```
dmarc-report:
  image: "gutmensch/dmarc-report:latest"
  hostname: dmarc-report
  container_name: dmarc-report
  environment:
    - "TEMPLATE_NGINX_HTML=1"
    - "TEMPLATE_PERL_CONF=1"
    - "REPORT_DB_HOST=mysql"
    - "REPORT_DB_NAME=dmarc_report"
    - "REPORT_DB_USER=dmarc_report"
    - "REPORT_DB_PASS=foobar"
    - "PARSER_IMAP_SERVER_WITH_PORT=mail:143"
    - "PARSER_IMAP_USER=foobar@example.com
    - "PARSER_IMAP_PASS=foobar"
    - "PARSER_IMAP_READ_FOLDER=Inbox"
    - "PARSER_IMAP_MOVE_FOLDER=processed"
```

