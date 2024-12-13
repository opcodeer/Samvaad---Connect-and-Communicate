import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    console.log("sendMessage function triggered");

    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        console.log("Request Body:", req.body);
        console.log("Request Params (Receiver ID):", receiverId);
        console.log("Sender ID:", senderId);

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            console.log("No conversation found. Creating a new conversation.");
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        } else {
            console.log("Existing conversation found:", conversation._id);
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        console.log("New Message to Save:", newMessage);

        if (newMessage) {
            conversation.messages.push(newMessage._id);
            console.log("Message ID added to conversation:", newMessage._id);
        }

        // Save conversation and message in parallel
        await Promise.all([conversation.save(), newMessage.save()]);
        console.log("Conversation and message saved successfully.");

        // SOCKET.IO FUNCTIONALITY
        const receiverSocketId = getReceiverSocketId(receiverId);
        console.log("Receiver Socket ID:", receiverSocketId);

        if (receiverSocketId) {
            console.log("Sending message to Socket ID:", receiverSocketId);
            io.to(receiverSocketId).emit("newMessage", newMessage);
        } else {
            console.log("Receiver is not connected to a socket.");
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    console.log("getMessages function triggered");

    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        console.log("Sender ID:", senderId);
        console.log("User to Chat ID:", userToChatId);

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");

        if (!conversation) {
            console.log("No conversation found between these users.");
            return res.status(200).json([]);
        }

        console.log("Conversation found. Messages:", conversation.messages);

        res.status(200).json(conversation.messages);
    } catch (error) {
        console.error("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
