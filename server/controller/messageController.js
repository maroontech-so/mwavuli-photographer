const Message = require("../models/Message");

// Public: create a contact message
exports.createMessage = async (req, res) => {
    try {
        const message = await Message.create(req.body);
        res.status(201).json({
            success: true,
            message: "Message sent successfully!",
            data: message
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: list messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: delete a message
exports.deleteMessage = async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Message deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
