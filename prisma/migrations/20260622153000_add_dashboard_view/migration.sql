-- CreateIndex
CREATE INDEX "transactions_user_id_type_date_idx" ON "transactions"("user_id", "type", "date" DESC);

-- CreateView
CREATE VIEW "dashboard_transaction_facts" AS
SELECT
    t."id" AS "transaction_id",
    t."user_id" AS "user_id",
    t."category_id" AS "category_id",
    c."name" AS "category_name",
    t."type" AS "type",
    t."amount" AS "amount",
    t."date" AS "date"
FROM "transactions" t
INNER JOIN "categories" c ON c."id" = t."category_id";
