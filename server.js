const express = require("express");
const cors = require("cors");

const { tokenize } = require("./engine/lexer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({
        name: "FD Language",
        version: "0.1.0",
        developer: "FD_56",
        status: "online",
        engine: "FD Lexer"
    });
});

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        server: "FD Server",
        version: "0.1.0",
        engine: "lexer",
        status: "online"
    });
});

app.post("/api/lex", (req, res) => {
    try {
        const code = req.body?.code;

        if (typeof code !== "string") {
            return res.status(400).json({
                success: false,
                error: "code must be a string"
            });
        }

        const tokens = tokenize(code);

        res.json({
            success: true,
            version: "0.1.0",
            tokens
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`FD Server running on port ${PORT}`);
});