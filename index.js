const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const imageUrl = process.env.IMAGE_URL || "https://minifiedecomm.onrender.com/";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from all origins
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    const fileName = `${req.body.name}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Route to check if the server is running
app.get("/", (req, res) => {
  res.send("Server is running!  ${PORT}");
});

app.post("/api/data", upload.array("images", 5), async (req, res) => {
  try {
    // Extract data from request body
    const { name, productCode, size, type, weight, price, category } = req.body;
    const images = req.files.map(file => imageUrl + 'uploads/' + file.filename);
    
    // Respond with uploaded data
    res.status(201).json({ name, productCode, size, type, weight, price, category, images });

    // You can add additional logic here to process the data if needed

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const storageB = multer.diskStorage({
  destination: "banners/",
  filename: function (req, file, cb) {
    const fileType = file.fieldname; // Get the fieldname (either "web" or "mobile")
    const fileName = `${Date.now()}${fileType}${path.extname(file.originalname)}`; // Ensure unique filenames
    cb(null, fileName);
  }
});

const uploadB = multer({ storage: storageB });

app.post("/api/banners", uploadB.fields([
  { name: 'webBanner', maxCount: 1 },
  { name: 'mobileBanner', maxCount: 1 }
]), async (req, res) => {
  try {
    const webBanner = req.files['webBanner'][0].filename;
    const mobileBanner = req.files['mobileBanner'][0].filename;
    console.log(webBanner, mobileBanner);

    // Additional processing or saving logic can be added here

    res.status(200).send("Banner uploaded successfully");
    const formData = {
      "entry.676789520": imageUrl+'banners/'+webBanner,
      "entry.164560208": imageUrl+'banners/'+mobileBanner,
    };

    const formUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLSc7BlSaP8cYzG5igq1VB0buMxPDy8VgnmC9sEarX14sxgh1Dg/formResponse";

  // Convert formData to URLSearchParams format
  const params = new URLSearchParams(formData);

  // Send POST request to Google Form
  await fetch(formUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    mode: "no-cors",
  });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Set up static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/banners", express.static(path.join(__dirname, "banners")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
