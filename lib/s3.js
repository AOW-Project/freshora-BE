import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(
  fileBuffer,
  originalName,
  folder = "order-items"
) {
  const ext = path.extname(originalName) || ".jpg";
  const key = `${folder}/${crypto.randomUUID()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: "image/jpeg",
    // ACL: "public-read",
  });

  await s3.send(command);

  return `${process.env.AWS_S3_BASE_URL}/${key}`;
}

export async function deleteFromS3(fileUrl) {
  if (!fileUrl) return;

  const key = fileUrl.split(".com/")[1]; // extract "folder/filename.jpg"
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  await s3.send(command);
}
