const { S3Client, HeadObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const SLOTS = ["hero", "about", "events"];

// GET /api/sections — retourne les URLs des photos de section présentes dans R2
exports.getSections = async (req, res) => {
  if (!process.env.S3_BUCKET || !process.env.S3_PUBLIC_URL) return res.json({});
  const result = {};
  await Promise.all(
    SLOTS.map(async (slot) => {
      try {
        await s3.send(new HeadObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: `sections/${slot}`,
        }));
        result[slot] = `${process.env.S3_PUBLIC_URL}/sections/${slot}`;
      } catch {
        // pas encore uploadé — on n'inclut pas le slot
      }
    })
  );
  res.json(result);
};
