<?php

// ####################################################################
// ### configuration ##################################################
// ####################################################################

$dbtype=getenv('REPORT_DB_TYPE');
$dbhost=getenv('REPORT_DB_HOST');
$dbport=getenv('REPORT_DB_PORT');
$dbname=getenv('REPORT_DB_NAME');
$dbuser=getenv('REPORT_DB_USER');
$dbpass=getenv('REPORT_DB_PASS');

$cssfile="default.css";

$default_hostlookup = 1;  # 1=on 0=off (on is old behaviour )
$default_sort = 1;  # 1=ASCdening 0=DESCending (ASCending is default behaviour )

?>
