const startButton = document.querySelector(".start-button");
const stopButton = document.querySelector(".stop-button");
const markButton = document.querySelector(".mark-attendance");
const cameraPreview = document.querySelector(".camera-preview");
const downloadContainer = document.querySelector(".download-link-container");

let stream = null;
let videoElement = null;

function createVideoElement() {
  videoElement = document.createElement("video");
  videoElement.setAttribute("autoplay", true);
  videoElement.setAttribute("playsinline", true);
  videoElement.style.width = "100%";
  videoElement.style.height = "100%";
  videoElement.style.borderRadius = "2rem";

  cameraPreview.textContent = "";
  cameraPreview.appendChild(videoElement);
}

startButton.addEventListener("click", async () => {
  try {
    if (!videoElement) {
      createVideoElement();
    }

    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    await videoElement.play();
  } catch (error) {
    console.error("Error accessing camera:", error);
    alert("Camera access denied or not available.");
  }
});

stopButton.addEventListener("click", () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  if (videoElement) {
    videoElement.srcObject = null;
  }
  cameraPreview.innerHTML = "camera preview";
  videoElement = null;
  downloadContainer.innerHTML = "";
});

markButton.addEventListener("click", () => {
  if (videoElement && stream && videoElement.readyState >= 2) {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return; // No alert, just return silently

      try {
        // Step 1: Get pre-signed URL
        const response = await fetch("http://localhost:3000/get-upload-url");
        const data = await response.json();
        const uploadUrl = data.uploadUrl;

        // Step 2: Upload image to S3
        await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/jpeg",
          },
          body: blob,
        });

        // ✅ Success message
        alert("✅ Attendance marked successfully!");

        // Optional: show uploaded image link
        const s3Url = `https://face-attendance-bucket.s3.ap-south-1.amazonaws.com/${data.fileName}`;
        const a = document.createElement("a");
        a.href = s3Url;
        a.textContent = "View uploaded image";
        a.target = "_blank";
        a.style.color = "white";
        a.style.display = "block";
        a.style.marginTop = "1rem";

        downloadContainer.innerHTML = "";
        downloadContainer.appendChild(a);
      } catch (err) {
        console.error("🔴 Upload Error:", err); // Log error silently
      }
    }, "image/jpeg", 0.95);
  } else {
    alert("Please start the camera before marking attendance.");
  }
});
