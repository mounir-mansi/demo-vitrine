const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

// GET /api/gallery — liste les photos depuis R2
exports.listGallery = async (req, res) => {
  if (!process.env.S3_BUCKET) return res.json({ main: null, photos: [] });
  try {
    const data = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: "gallery/",
    }));
    const allItems = (data.Contents || []).filter((obj) => !obj.Key.endsWith("/"));

    const mainObj = allItems.find((obj) => obj.Key === "gallery/main");
    const main = mainObj
      ? { src: `${process.env.S3_PUBLIC_URL}/gallery/main`, alt: "Photo principale", key: "gallery/main" }
      : null;

    const photos = allItems
      .filter((obj) => obj.Key !== "gallery/main")
      .sort((a, b) => a.LastModified - b.LastModified)
      .map((obj) => ({
        src: `${process.env.S3_PUBLIC_URL}/${obj.Key}`,
        alt: "Photo",
        key: obj.Key,
      }));

    res.json({ main, photos });
  } catch (err) {
    console.error("listGallery error:", err.message);
    res.json({ main: null, photos: [] });
  }
};

// DELETE /admin/gallery — supprime une photo (key dans le body)
exports.deleteGalleryPhoto = async (req, res) => {
  const { key } = req.body;
  if (!key || !key.startsWith("gallery/")) {
    return res.status(400).json({ error: "Clé invalide" });
  }
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
