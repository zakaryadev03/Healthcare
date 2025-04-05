// patient-service/middleware/apiKeyMiddleware.js
const validateAPIKey = (req, res, next) => {
    const expectedKey = process.env.INTERNAL_API_KEY;
    const receivedKey = req.headers['x-internal-api-key'];
    
    if (!receivedKey || receivedKey !== expectedKey) {
        return res.status(403).json({
            error: "Forbidden",
            message: "Invalid internal API key"
        });
    }
    next();
};

module.exports = validateAPIKey;