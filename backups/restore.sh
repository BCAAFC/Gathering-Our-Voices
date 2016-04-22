#! /usr/bin/env bash

FOLDER=backups
DATE=`basename ${1%.*.*}`
DATABASE=gov

tar -zxf $1

read -p "Drop DB $DATABASE and restore from $DATE? (y/n)? " CHOICE
case "$CHOICE" in
    y|Y ) echo "Proceeding...";;
    n|N ) exit 1;;
    * ) exit 1;;
esac

dropdb $DATABASE
createdb $DATABASE
psql $DATABASE < $FOLDER/$DATE/gov.sql
cp -r $FOLDER/$DATE/ uploads
rm -r $FOLDER/$DATE
