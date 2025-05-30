const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "frontend")));

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/payrollDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schemas
const budgetSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  notes: String,
});
const Budget = mongoose.model("Budget", budgetSchema);

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: String,
  lastUpdated: { type: Date, default: Date.now },
});
const Inventory = mongoose.model("Inventory", inventorySchema);

// API Routes for Budget
app.get("/api/budget", async (_req, res) => {
  try {
    const items = await Budget.find();
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to retrieve budget items" });
  }
});

app.post("/api/budget", async (req, res) => {
  try {
    const newItem = new Budget(req.body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch {
    res.status(400).json({ error: "Failed to save budget item" });
  }
});

app.put("/api/budget/:id", async (req, res) => {
  try {
    const updated = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Failed to update budget item" });
  }
});

app.delete("/api/budget/:id", async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(400).json({ error: "Failed to delete budget item" });
  }
});

// API Routes for Inventory
app.get("/api/inventory", async (_req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to get inventory items" });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch {
    res.status(400).json({ error: "Failed to save inventory item" });
  }
});

app.put("/api/inventory/:id", async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Failed to update inventory item" });
  }
});

app.delete("/api/inventory/:id", async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(400).json({ error: "Failed to delete inventory item" });
  }
});

// Fallback route to serve frontend index.html
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "frontend", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend not found");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
