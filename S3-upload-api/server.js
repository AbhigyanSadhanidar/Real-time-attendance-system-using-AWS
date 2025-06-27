import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

app.get("/get-upload-url", async (req, res) => {
  const fileName = `attendance-${Date.now()}.jpg`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    ContentType: "image/jpeg"
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  res.json({ uploadUrl: signedUrl, fileName });
});

app.listen(3000, () => {
  console.log("✅ Server is running at http://localhost:3000");
});

