#! /bin/bash

WEBROOT=/home/worker/gov2017
DOMAIN=gatheringourvoices.bcaafc.com,gov.hoverbear.org
EMAIL=andrew@hoverbear.org
KEY_SIZE=4096

letsencrypt --renew --webroot -w $WEBROOT --domain $DOMAIN --email $EMAIL --rsa-key-size $KEY_SIZE certonly
/etc/init.d/nginx restart
