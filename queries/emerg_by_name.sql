# This query fetches emergency contact information of delegates by their name. This is intended to be imported by Excel.

COPY (
    SELECT "Members"."name", "Accounts"."affiliation", "Accounts"."city", "Accounts"."name", "Accounts"."phone", "Members"."contactName", "Members"."contactRelation", "Members"."contactPhone", "Members"."medicalNumber"
    FROM "Accounts", "Groups", "Members"
    WHERE "Groups"."AccountId" = "Accounts"."id" AND "Members"."GroupId" = "Groups"."id"
) TO STDOUT WITH HEADER CSV;
