const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("."));

app.get("/api/status", (req, res) => {
    res.json({
        status: "online",
        project: "FD Language",
        version: "1.0.0"
    });
});

app.get("*", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`FD Server running on port ${PORT}`);
});