# docker-dmarc-reports [![Docker Pulls](https://img.shields.io/docker/pulls/gutmensch/dmarc-reports.svg)](https://registry.hub.docker.com/u/gutmensch/dmarc-reports/)

This image is intended to combine a dmarc report parser (see https://github.com/techsneeze/dmarcts-report-parser by TechSneeze.com and John Bieling) with a report viewer (see https://github.com/techsneeze/dmarcts-report-viewer/ by the same people) into a runnable docker image / microservice. It fetches dmarc report mails regularly from an IMAP server, stores them into a MySQL DB, deletes them from IMAP and show them via Webserver/PHP module.

## Usage
```
docker pull gutmensch/dmarc-reports
docker run -ti gutmensch/dmarc-reports start.sh
```
