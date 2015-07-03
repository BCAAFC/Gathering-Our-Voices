DATE=`date +%F`

mkdir -p backups/$DATE
pg_dump gov2016 > backups/$DATE/gov2016_backup.sql
cp -r uploads backups/$DATE/
