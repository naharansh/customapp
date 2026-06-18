import { Sequelize, QueryTypes } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
    },
  }
);

async function query(
  sql: string,
  replacements?: Record<string, unknown> | unknown[]
) {
  const opts: Record<string, unknown> = {};
  if (Array.isArray(replacements)) {
    if (replacements.length > 0) {
      opts.replacements = replacements.map((v) =>
        v === undefined ? null : v
      );
    }
  } else if (replacements) {
    Object.assign(opts, replacements);
  }

  const raw = await sequelize.query(sql, opts);

  const isInsert = /^\s*INSERT\s/i.test(sql.trim());
  const isUpdateDelete = /^\s*(UPDATE|DELETE)\s/i.test(sql.trim());

  if (isInsert && typeof raw[0] === "number") {
    return [{ insertId: raw[0], affectedRows: raw[1] }, raw[1]];
  }

  if (isUpdateDelete && raw[0] === null) {
    return [{ affectedRows: raw[1] }, raw[1]];
  }

  return raw;
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
  }
})();

export { query, sequelize, QueryTypes };
