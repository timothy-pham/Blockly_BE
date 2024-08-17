const User = require("../models/user");
const Ticket = require("../models/ticket");
const moment = require('moment');

exports.createTicket = async (req, res) => {
    try {
        const { title, message, meta_data } = req.body;
        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }
        const ticket_data = new Ticket({
            user_id: req.user.user_id,
            title,
            messages: [{ type: 'request', message, timestamp: moment().unix(), send_at: moment().format() }],
            status: 'open',
            meta_data,
            timestamp: moment().unix(),
            created_at: moment().format(),
            updated_at: moment().format()
        });
        await ticket_data.save();
        res.status(201).json(ticket_data);
    } catch (error) {
        console.log("CREATE TICKET ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({});
        res.status(200).json(tickets);
    } catch (error) {
        console.log("GET TICKETS ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findOne({ ticket_id: parseInt(id) });
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.status(200).json(ticket);
    } catch (error) {
        console.log("GET TICKET BY ID ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getUserTickets = async (req, res) => {
    try {
        const { id } = req.params;
        const tickets = await Ticket.find({ user_id: parseInt(id) });
        res.status(200).json(tickets);
    } catch (error) {
        console.log("GET USER TICKETS ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const ticket = await Ticket.findOne({ ticket_id: parseInt(id) });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        ticket.status = status;
        ticket.updated_at = moment().format();
        ticket.timestamp = moment().unix();
        await ticket.save();
        res.status(200).json(ticket);
    }
    catch (error) {
        console.log("UPDATE TICKET ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.sendRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const user_id = req.user.user_id;
        const ticket = await Ticket.findOne({ ticket_id: parseInt(id) });
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }
        // check if ticket is created by the user
        if (ticket.user_id !== user_id) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        ticket.messages.push({ type: 'request', message, timestamp: moment().unix(), send_at: moment().format() });
        ticket.updated_at = moment().format();
        ticket.status = 'open';
        ticket.timestamp = moment().unix();
        await ticket.save();
        res.status(200).json(ticket);
    } catch (error) {
        console.log("SEND REQUEST ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.sendResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const ticket = await Ticket.findOne({ ticket_id: parseInt(id) });
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }
        ticket.messages.push({ type: 'response', message, timestamp: moment().unix(), send_at: moment().format() });
        ticket.updated_at = moment().format();
        ticket.status = 'responded';
        ticket.timestamp = moment().unix();
        await ticket.save();
        res.status(200).json(ticket);
    } catch (error) {
        console.log("SEND RESPONSE ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findOne({ ticket_id: parseInt(id) });
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        await ticket.remove();
        res.status(200).json({ message: "Ticket deleted" });
    } catch (error) {
        console.log("DELETE TICKET ERROR", error);
        res.status(500).json({ message: "Internal server error" });
    }
}