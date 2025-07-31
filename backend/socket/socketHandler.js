const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Poll = require("../models/Poll");
const Message = require("../models/Message");

// Store active connections
const activeConnections = new Map();

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      if (user.isKickedOut && !user.canRejoin()) {
        return next(new Error("Access denied: User is kicked out"));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.userRole = user.role;
      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.userName} (${socket.userRole})`);

    try {
      // Update user socket ID and active status
      const user = await User.findByIdAndUpdate(
        socket.userId,
        {
          socketId: socket.id,
          isActive: true,
          lastSeen: new Date(),
        },
        { new: true }
      );

      // Store connection
      activeConnections.set(socket.userId, socket);

      // Join user to session-specific rooms
      if (user.currentSession) {
        socket.join(`session_${user.currentSession}`);
        socket.join(`${user.currentSession}_${socket.userRole}`); // session-specific role room
      }
      socket.join(socket.userRole); // 'student' or 'teacher'

      // Emit updated participant list
      if (user.currentSession) {
        await emitParticipantList(io, user.currentSession);
      }

      // Send current poll if exists
      await sendCurrentPoll(socket);
    } catch (error) {
      console.error("Connection setup error:", error);
    }

    // Handle poll creation (teachers only)
    socket.on("create_poll", async (data) => {
      try {
        if (socket.userRole !== "teacher") {
          socket.emit("error", { message: "Only teachers can create polls" });
          return;
        }

        const { question, options, correctAnswer, duration } = data;

        // End any active polls
        await Poll.updateMany(
          { sessionId: socket.user.currentSession, status: "active" },
          { status: "completed", endTime: new Date(), isLive: false }
        );

        // Create new poll
        const poll = new Poll({
          question,
          options: options.map((opt) => ({
            text: opt.trim(),
            votes: 0,
            voters: [],
          })),
          correctAnswer: correctAnswer || null,
          duration: duration || 60,
          createdBy: socket.userId,
          createdByName: socket.userName,
          sessionId: socket.user.currentSession,
          startTime: new Date(),
        });

        await poll.save();

        // Emit new poll to all users
        const pollData = {
          id: poll._id,
          question: poll.question,
          options: poll.options.map((opt) => ({ text: opt.text, votes: 0 })),
          duration: poll.duration,
          startTime: poll.startTime,
          timeRemaining: poll.duration,
        };

        io.to(`session_${socket.user.currentSession}`).emit(
          "new_poll",
          pollData
        );

        // Auto-end poll after duration
        setTimeout(async () => {
          try {
            const activePoll = await Poll.findById(poll._id);
            if (activePoll && activePoll.status === "active") {
              await activePoll.endPoll();
              io.to("general").emit("poll_ended", {
                id: activePoll._id,
                results: activePoll.results,
                totalVotes: activePoll.totalVotes,
              });
            }
          } catch (error) {
            console.error("Auto-end poll error:", error);
          }
        }, poll.duration * 1000);
      } catch (error) {
        console.error("Create poll error:", error);
        socket.emit("error", { message: "Failed to create poll" });
      }
    });

    // Handle voting (students only)
    socket.on("vote", async (data) => {
      try {
        if (socket.userRole !== "student") {
          socket.emit("error", { message: "Only students can vote" });
          return;
        }

        const { pollId, selectedOption } = data;

        const poll = await Poll.findById(pollId);
        if (!poll || poll.status !== "active" || poll.isExpired()) {
          socket.emit("error", { message: "Poll is no longer active" });
          return;
        }

        // Check if user already voted
        const hasVoted = poll.options.some((option) =>
          option.voters.some(
            (voter) => voter.userId.toString() === socket.userId
          )
        );

        if (hasVoted) {
          socket.emit("error", { message: "You have already voted" });
          return;
        }

        // Add vote
        await poll.addVote(selectedOption, socket.userId, socket.userName);

        // Send confirmation to voter
        socket.emit("vote_confirmed", {
          pollId: poll._id,
          selectedOption,
          results: poll.results,
          totalVotes: poll.totalVotes,
        });

        // Send updated results to teachers
        io.to(`${socket.user.currentSession}_teacher`).emit("poll_update", {
          pollId: poll._id,
          results: poll.results,
          totalVotes: poll.totalVotes,
        });
      } catch (error) {
        console.error("Vote error:", error);
        socket.emit("error", {
          message: error.message || "Failed to record vote",
        });
      }
    });

    // Handle chat messages
    socket.on("send_message", async (data) => {
      try {
        const { content, messageType = "text" } = data;

        if (!content || content.trim().length === 0) {
          socket.emit("error", { message: "Message content is required" });
          return;
        }

        const message = new Message({
          content: content.trim(),
          sender: socket.userId,
          senderName: socket.userName,
          senderRole: socket.userRole,
          sessionId: socket.user.currentSession,
          messageType,
        });

        await message.save();

        const messageData = {
          id: message._id,
          content: message.content,
          senderName: message.senderName,
          senderRole: message.senderRole,
          messageType: message.messageType,
          timestamp: message.createdAt,
        };

        // Broadcast message to all users
        io.to(`session_${socket.user.currentSession}`).emit(
          "new_message",
          messageData
        );
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle kick out (teachers only)
    socket.on("kick_user", async (data) => {
      try {
        if (socket.userRole !== "teacher") {
          socket.emit("error", { message: "Only teachers can kick out users" });
          return;
        }

        const { userId } = data;
        const targetUser = await User.findById(userId);

        if (!targetUser) {
          socket.emit("error", { message: "User not found" });
          return;
        }

        if (targetUser.role !== "student") {
          socket.emit("error", { message: "Can only kick out students" });
          return;
        }

        // Update user status
        targetUser.isKickedOut = true;
        targetUser.kickedOutAt = new Date();
        targetUser.kickedOutBy = socket.userId;
        targetUser.isActive = false;
        await targetUser.save();

        // Notify the kicked user
        const targetSocket = activeConnections.get(userId);
        if (targetSocket) {
          targetSocket.emit("kicked_out", {
            message: "You have been removed from the session",
            kickedBy: socket.userName,
          });
          targetSocket.disconnect();
        }

        // Remove from active connections
        activeConnections.delete(userId);

        // Notify all users about the kick
        io.to(`session_${socket.user.currentSession}`).emit("user_kicked", {
          userId: targetUser._id,
          userName: targetUser.name,
          kickedBy: socket.userName,
        });

        // Update participant list
        await emitParticipantList(io, socket.user.currentSession);
      } catch (error) {
        console.error("Kick user error:", error);
        socket.emit("error", { message: "Failed to kick out user" });
      }
    });

    // Handle end poll (teachers only)
    socket.on("end_poll", async (data) => {
      try {
        if (socket.userRole !== "teacher") {
          socket.emit("error", { message: "Only teachers can end polls" });
          return;
        }

        const poll = await Poll.findOne({
          createdBy: socket.userId,
          status: "active",
        });

        if (!poll) {
          socket.emit("error", { message: "No active poll found" });
          return;
        }

        await poll.endPoll();

        // Notify all users that poll has ended
        io.to(`session_${socket.user.currentSession}`).emit("poll_ended", {
          id: poll._id,
          results: poll.results,
          totalVotes: poll.totalVotes,
          correctAnswer: poll.correctAnswer,
        });
      } catch (error) {
        console.error("End poll error:", error);
        socket.emit("error", { message: "Failed to end poll" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.userName} (${socket.userRole})`);

      try {
        // Update user status
        await User.findByIdAndUpdate(socket.userId, {
          isActive: false,
          socketId: null,
          lastSeen: new Date(),
        });

        // Remove from active connections
        activeConnections.delete(socket.userId);

        // Emit updated participant list
        await emitParticipantList(io);
      } catch (error) {
        console.error("Disconnect cleanup error:", error);
      }
    });
  });

  // Helper functions
  async function emitParticipantList(io, sessionId) {
    try {
      const participants = await User.find({
        currentSession: sessionId,
        isActive: true,
        isKickedOut: false,
      })
        .select("name role lastSeen")
        .sort({ role: 1, name: 1 });

      const participantList = participants.map((user) => ({
        id: user._id,
        name: user.name,
        role: user.role,
        lastSeen: user.lastSeen,
      }));

      io.to(`session_${sessionId}`).emit("participants_update", {
        participants: participantList,
      });
    } catch (error) {
      console.error("Emit participants error:", error);
    }
  }

  async function sendCurrentPoll(socket) {
    try {
      if (!socket.user.currentSession) return;

      const poll = await Poll.findOne({
        sessionId: socket.user.currentSession,
        status: "active",
        isLive: true,
      }).sort({ startTime: -1 });

      if (poll && !poll.isExpired()) {
        // Check if user has voted (for students)
        let hasVoted = false;
        if (socket.userRole === "student") {
          hasVoted = poll.options.some((option) =>
            option.voters.some(
              (voter) => voter.userId.toString() === socket.userId
            )
          );
        }

        const pollData = {
          id: poll._id,
          question: poll.question,
          options: poll.options.map((opt) => ({
            text: opt.text,
            votes: socket.userRole === "teacher" ? opt.votes : 0,
          })),
          duration: poll.duration,
          startTime: poll.startTime,
          hasVoted,
          timeRemaining: Math.max(
            0,
            poll.duration - Math.floor((new Date() - poll.startTime) / 1000)
          ),
          totalVotes: socket.userRole === "teacher" ? poll.totalVotes : 0,
        };

        if (hasVoted && socket.userRole === "student") {
          pollData.results = poll.results;
          pollData.totalVotes = poll.totalVotes;
        }

        socket.emit("current_poll", pollData);
      }
    } catch (error) {
      console.error("Send current poll error:", error);
    }
  }
};

module.exports = socketHandler;
