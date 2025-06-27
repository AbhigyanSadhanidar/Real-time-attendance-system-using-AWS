const AWS = require("aws-sdk");

// Initialize AWS services
const rekognition = new AWS.Rekognition();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("🟡 Lambda triggered with event:", JSON.stringify(event));

  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    const params = {
      CollectionId: "faceAttendance",
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      },
      FaceMatchThreshold: 90,
      MaxFaces: 1
    };

    const result = await rekognition.searchFacesByImage(params).promise();

    if (result.FaceMatches && result.FaceMatches.length > 0) {
      const matchedFace = result.FaceMatches[0].Face;

      const logEntry = {
        TableName: "attendace_table",
        Item: {
          FaceId: matchedFace.FaceId,
          ExternalImageId: matchedFace.ExternalImageId || "Unknown",
          Timestamp: new Date().toISOString()
        }
      };

      await dynamodb.put(logEntry).promise();
      console.log("✅ Attendance logged for:", matchedFace.ExternalImageId);
    } else {
      console.log("❌ No face match found.");
    }

    return { statusCode: 200 };
  } catch (err) {
    console.error("❌ Lambda error:", err);
    return { statusCode: 500, error: err.message };
  }
};
