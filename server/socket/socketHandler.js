const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ArenaMatch = require('../models/ArenaMatch');

const activeUsers = new Map();
const matchRooms = new Map();

const socketHandler = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);
    
    // Store active user
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      status: 'online'
    });

    // Update user online status
    User.findByIdAndUpdate(socket.userId, { isOnline: true }).exec();

    // Join arena match room
    socket.on('join-arena', async (roomId) => {
      try {
        const match = await ArenaMatch.findOne({ roomId })
          .populate('players.user', 'username avatar stats')
          .populate('problem', 'title description difficulty examples constraints starterCode');

        if (!match) {
          socket.emit('arena-error', { message: 'Match not found' });
          return;
        }

        // Check if user is in match
        const isInMatch = match.players.some(
          player => player.user._id.toString() === socket.userId
        );

        if (!isInMatch) {
          socket.emit('arena-error', { message: 'Not authorized to join this match' });
          return;
        }

        socket.join(roomId);
        
        // Store room mapping
        if (!matchRooms.has(roomId)) {
          matchRooms.set(roomId, new Set());
        }
        matchRooms.get(roomId).add(socket.id);

        // Send match data
        socket.emit('arena-joined', { match });
        
        // Notify other players
        socket.to(roomId).emit('player-joined', {
          user: socket.user,
          timestamp: new Date()
        });

        // Start match if both players are connected and match is waiting
        if (match.status === 'waiting' && match.players.length === 2) {
          const roomSockets = matchRooms.get(roomId);
          if (roomSockets && roomSockets.size === 2) {
            match.status = 'active';
            match.startTime = new Date();
            match.players.forEach(player => {
              player.status = 'coding';
            });
            await match.save();

            io.to(roomId).emit('match-started', {
              match,
              startTime: match.startTime
            });
          }
        }

      } catch (error) {
        console.error('Join arena error:', error);
        socket.emit('arena-error', { message: 'Failed to join arena' });
      }
    });

    // Handle code updates in arena
    socket.on('code-update', async (data) => {
      try {
        const { roomId, code, language } = data;
        
        const match = await ArenaMatch.findOne({ roomId });
        if (!match) return;

        // Update player's code
        const playerIndex = match.players.findIndex(
          player => player.user.toString() === socket.userId
        );

        if (playerIndex !== -1) {
          match.players[playerIndex].code = code;
          match.players[playerIndex].language = language;
          await match.save();

          // Broadcast to other players (without the code for privacy)
          socket.to(roomId).emit('opponent-coding', {
            playerId: socket.userId,
            isTyping: code.length > 0,
            timestamp: new Date()
          });
        }

      } catch (error) {
        console.error('Code update error:', error);
      }
    });

    // Handle code submission in arena
    socket.on('submit-code', async (data) => {
      try {
        const { roomId, code, language } = data;
        
        const match = await ArenaMatch.findOne({ roomId });
        if (!match) return;

        const playerIndex = match.players.findIndex(
          player => player.user.toString() === socket.userId
        );

        if (playerIndex !== -1) {
          match.players[playerIndex].status = 'submitted';
          match.players[playerIndex].submittedAt = new Date();
          match.players[playerIndex].code = code;
          match.players[playerIndex].language = language;

          await match.save();

          // Notify room about submission
          io.to(roomId).emit('player-submitted', {
            playerId: socket.userId,
            playerName: socket.user.username,
            timestamp: new Date()
          });

          // Check if both players submitted
          const allSubmitted = match.players.every(
            player => player.status === 'submitted'
          );

          if (allSubmitted) {
            // Determine winner (for now, first to submit wins)
            const winner = match.players.reduce((fastest, current) => 
              (!fastest || current.submittedAt < fastest.submittedAt) ? current : fastest
            );

            match.winner = winner.user;
            match.status = 'finished';
            match.endTime = new Date();
            
            await match.save();
            await match.populate('winner', 'username avatar stats');

            // Update winner stats
            await User.findByIdAndUpdate(winner.user, {
              $inc: { 'stats.arenaWins': 1 }
            });

            // Update loser stats
            const loser = match.players.find(p => p.user.toString() !== winner.user.toString());
            if (loser) {
              await User.findByIdAndUpdate(loser.user, {
                $inc: { 'stats.arenaLosses': 1 }
              });
            }

            // Notify match finished
            io.to(roomId).emit('match-finished', {
              winner: match.winner,
              match,
              timestamp: new Date()
            });
          }
        }

      } catch (error) {
        console.error('Submit code error:', error);
      }
    });

    // Handle chat messages in arena
    socket.on('arena-chat', async (data) => {
      try {
        const { roomId, message } = data;
        
        const match = await ArenaMatch.findOne({ roomId });
        if (!match) return;

        // Add message to match
        match.chatMessages.push({
          user: socket.userId,
          message,
          timestamp: new Date()
        });

        await match.save();

        // Broadcast message
        io.to(roomId).emit('arena-chat', {
          user: {
            id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          message,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Arena chat error:', error);
      }
    });

    // Handle friend requests
    socket.on('friend-request-sent', (data) => {
      const { targetUserId } = data;
      const targetUser = activeUsers.get(targetUserId);
      
      if (targetUser) {
        io.to(targetUser.socketId).emit('friend-request-received', {
          from: {
            id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          timestamp: new Date()
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Remove from match rooms
      matchRooms.forEach((sockets, roomId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          
          // Notify room about disconnection
          socket.to(roomId).emit('player-disconnected', {
            playerId: socket.userId,
            playerName: socket.user.username,
            timestamp: new Date()
          });

          // Clean up empty rooms
          if (sockets.size === 0) {
            matchRooms.delete(roomId);
          }
        }
      });
    });
  });
};

module.exports = socketHandler;