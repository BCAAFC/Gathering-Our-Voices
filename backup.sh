#! /usr/bin/env bash

# This script creates a backup for the database and uploads folder based on the date and shuffles it away.
# Restoring the database is as simple as copying the uploads folder, recreating the db (dropdb, createdb) and piping the `gov_backup.sql` file in.

DATE=`date +%F`

mkdir -p backups/$DATE
pg_dump gov2016 > backups/$DATE/gov_backup.sql
cp -r uploads backups/$DATE/
