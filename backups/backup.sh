#! /usr/bin/env bash

# This script creates a backup for the database and uploads folder based on the date and
# shuffles it away.
# Restoring the database is as simple as copying the uploads folder, recreating the db
# (dropdb, createdb) and piping the `gov_backup.sql` file in.

DATE=`date +%F`
FOLDER=backups
DATABASE=gov

mkdir -p $FOLDER/$DATE
pg_dump $DATABASE > $FOLDER/$DATE/gov.sql
cp -r uploads $FOLDER/$DATE/
tar -zcf $FOLDER/$DATE.tar.gz $FOLDER/$DATE
rm -r $FOLDER/$DATE

echo "Created backup for $DATE at $FOLDER/$DATE.tar.gz"
