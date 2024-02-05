const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const imageUrl = process.env.IMAGE_URL || "https://your-render-app-url.com/";

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
  res.send("Server is running!");
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

// Set up static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
