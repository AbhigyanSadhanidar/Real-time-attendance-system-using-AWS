# Real-Time Attendance System using AWS Rekognition

A serverless facial recognition-based attendance system built using AWS services such as Rekognition, Lambda, S3, and DynamoDB. Users capture their face through a webcam interface, and attendance is automatically recorded if a match is found.

---

## 🧭 System Architecture

![System Architecture](architecture/architecture-diagram.png)


---

## 🧠 Features

- Webcam-based face capture from a web UI
- Real-time face recognition using AWS Rekognition
- Attendance logging with timestamp in DynamoDB
- S3-based image upload + Lambda automation
- Logs monitored via AWS CloudWatch

---

## 🧱 Tech Stack

- **Frontend**: React.js (in `/webcamui`)
- **Backend API**: Node.js Express server (in `/S3-upload-api`)
- **Image Processing**: AWS Rekognition (triggered via Lambda)
- **Storage**: Amazon S3
- **Database**: DynamoDB

---

## ⚙️ How It Works

1. User opens the frontend (`webcamui`) hosted on S3
2. Captures image via webcam → sent to S3 via pre-signed URL
3. Image upload triggers a Lambda function
4. Lambda invokes Rekognition to compare with stored faces
5. If match found, logs entry in DynamoDB


