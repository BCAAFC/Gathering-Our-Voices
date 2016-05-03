#! /bin/bash

WEBROOT=/home/worker/gov2017/cert/
DOMAIN=gatheringourvoices.bcaafc.com,gov.hoverbear.org
EMAIL=andrew@hoverbear.org
KEY_SIZE=4096

if [ ! -e $WEBROOT/dh.pem ]; then
  openssl dhparam -out $WEBROOT/dh.pem 2048 
fi

letsencrypt --renew-by-default --webroot -w $WEBROOT --domain $DOMAIN --email $EMAIL --rsa-key-size $KEY_SIZE certonly
/etc/init.d/nginx restart
