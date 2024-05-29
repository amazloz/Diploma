const express = require("express");
const http = require("http");
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const translate = require("translate-google");

dotenv.config();

const {
  getAllUsers,
  getUserInfo,
  createUser,
  getUserInfoByEmail,
  getAllInterests,
  getAllLanguages,
  getAllNotes,
  updateUserInfo,
  updateNativeLanguage,
  updateLearningLanguage,
  updateInterest,
  saveNote,
  getNote,
  deleteNote,
  updateNote,
  newFriends,
  selectFriends,
  updateUserRating,
  getFriendsInfo,
  deleteFriend,
  updateUserActiveStatus,
} = require("./database.js");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/match", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "match.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.get("/friends", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "friends.html"));
});

app.get("/room", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "test.html"));
});

app.post("/api/register", async (req, res) => {
  const data = req.body;
  const existingUser = await getUserInfo(data.username);

  if (existingUser) {
    return res.status(409).json({ message: "Username is already used" });
  }

  const existingEmail = await getUserInfoByEmail(data.email);
  if (existingEmail) {
    return res.status(409).json({ message: "Email is already used" });
  }
  const hash = await bcrypt.hash(data.password, 10);
  await createUser(
    data.username,
    data.email,
    data.gender,
    data.birthdate,
    hash
  );
  res.status(201).json({ message: "User created successfully" });
  console.log("User created:", data);
});
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const data = await getUserInfo(username);
    if (!data) {
      console.log("User not found");
      res.status(404).json({ message: "User not found" });
      return;
    }
    console.log(data);
    const isValid = await bcrypt.compare(password, data.user_pass);
    if (!isValid) {
      console.log("Invalid password");
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    if (data.isActive === 0) {
      console.log("Account blocked");
      res.status(401).json({ message: "Account blocked" });
      return;
    }
    console.log("User logged in successfully");
    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/profile", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  try {
    const user = await getUserInfo(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.put("/api/profile", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  try {
    const user = await getUserInfo(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/editprofile", async (req, res) => {
  const { username, updatedusername, email, birthdate, gender } = req.body;

  if (!updatedusername || !email || !birthdate || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await getUserInfo(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await updateUserInfo(username, updatedusername, email, gender, birthdate);
    res.status(200).json({ success: true, message: username });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/user/rating", async (req, res) => {
  const { username, increment, decrement } = req.body;
  try {
    const user = await getUserInfo(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let newRating = user.user_rating + increment - decrement;
    newRating = Math.min(newRating, 5); // Ensure the rating does not exceed 5

    await updateUserRating(username, newRating);
    console.log("Successfully updated user rating");
    res.status(200).json({ message: "User rating updated successfully" });
  } catch (error) {
    console.error("Error updating user rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/notes", async (req, res) => {
  try {
    const { created_by } = req.query;
    const note = await getAllNotes(created_by);
    if (!note) {
      return res.status(404).json({ message: "Notes not found" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error fetching note info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/notes", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    await saveNote(data.note_title, data.note_content, data.created_by);
    res.status(201).json({ message: "Note saved successfully" });
  } catch (error) {
    console.error("Error fetching note info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { note_title, note_content } = req.body;
    await updateNote(id, note_title, note_content);
    res.status(200).json({ message: "Note updated successfully" });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNote = await deleteNote(id);
    if (deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/admin", async (req, res) => {
  try {
    const user = await getAllUsers();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.put("/api/user/active", async (req, res) => {
  const { username, isActive } = req.body;
  try {
    const user = await getUserInfo(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await updateUserActiveStatus(username, isActive);
    res
      .status(200)
      .json({ message: "User active status updated successfully" });
  } catch (error) {
    console.error("Error updating user active status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/friends", async (req, res) => {
  try {
    const { id } = req.query;
    const users = await selectFriends(id);
    if (!users) {
      return res.status(404).json({ message: "User not found" });
    }
    const friendsPromises = users.map(async (user) => {
      const friendId = user.user_id2;
      const friendInfo = await getFriendsInfo(friendId);
      return friendInfo;
    });

    const friendsArrays = await Promise.all(friendsPromises);
    const friends = friendsArrays.flat();
    res.json(friends);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.delete("/api/friends", async (req, res) => {
  try {
    const { user_id1, user_id2 } = req.query;
    await deleteFriend(user_id1, user_id2);
    res.status(200).json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/interests", async (req, res) => {
  const allInterests = await getAllInterests();
  res.json(allInterests);
});
app.put("/api/interests/:username", async (req, res) => {
  const username = req.params.username;
  const { interest } = req.body;
  try {
    await updateInterest(username, interest);
    res
      .status(200)
      .json({ success: true, message: "Interest updated successfully" });
  } catch (error) {
    console.error("Error updating interest:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating interest",
    });
  }
});
app.get("/api/languages", async (req, res) => {
  const allLanguages = await getAllLanguages();
  res.json(allLanguages);
});
app.put("/api/languages/:username", async (req, res) => {
  const username = req.params.username;
  if (req.query.message === "native_language") {
    const { language } = req.body;
    try {
      await updateNativeLanguage(username, language);
      res.status(200).json({
        success: true,
        message: "Native language updated successfully",
      });
    } catch (error) {
      console.error("Error updating native language:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating native language",
      });
    }
  } else if (req.query.message === "learning_language") {
    const { language } = req.body;
    try {
      await updateLearningLanguage(username, language);
      res.status(200).json({
        success: true,
        message: "Learning language updated successfully",
      });
    } catch (error) {
      console.error("Error updating learning language:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating learning language",
      });
    }
  }
});
app.put("/api/translations", (req, res) => {
  console.log(req.body);
  const { from, choosen_language } = req.body;
  translate(from, { to: choosen_language })
    .then((translation) => {
      console.log(translation);
      res.status(200).json(translation);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

let connectedPeers = [];
let connectedPeersStrangers = [];
let connectedPeersStrangersUnder = [];

io.on("connection", (socket) => {
  connectedPeers.push(socket.id);
  connectedPeersStrangers.push(socket.id);
  console.log(connectedPeers);
  console.log(connectedPeersStrangers);
  console.log(connectedPeersStrangersUnder);

  socket.on("pre-offer", (data) => {
    const { calleePersonalCode, callType, myAge } = data;

    if (myAge < 18) {
      connectedPeersStrangers.filter(socket.id);
      connectedPeersStrangersUnder.push(socket.id);
      console.log(connectedPeersStrangers);
      console.log(connectedPeersStrangersUnder);
    }

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === calleePersonalCode
    );

    if (connectedPeer) {
      const data = {
        callerSocketId: socket.id,
        callType,
      };
      io.to(calleePersonalCode).emit("pre-offer", data);
    } else {
      const data = {
        preOfferAnswer: "CALLEE_NOT_FOUND",
      };
      io.to(socket.id).emit("post-offer-answer", data);
    }
  });

  socket.on("pre-offer-answer", (data) => {
    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === data.callerSocketId
    );

    if (connectedPeer) {
      io.to(data.callerSocketId).emit("pre-offer-answer", data);
    }
  });

  socket.on("webRTC-signaling", (data) => {
    const { connectedUserSocketId } = data;
    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === data.connectedUserSocketId
    );
    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("webRTC-signaling", data);
    }
  });

  socket.on("user-hanged-up", (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === data.connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("user-hanged-up");
    }
  });

  socket.on("stranger-connection-status", (data) => {
    const { status } = data;
    if (status) {
      connectedPeersStrangers.push(socket.id);
    } else {
      const newConnectedPeersStrangers = connectedPeersStrangers.filter(
        (peerSocketId) => peerSocketId !== socket.id
      );
      connectedPeersStrangers = newConnectedPeersStrangers;
    }
    console.log(connectedPeersStrangers);
  });

  socket.on("get-stranger-socket-id", () => {
    let randomStrangerSocketId;
    const filteredConnectedPeersStrangers = connectedPeersStrangers.filter(
      (peerSocketId) => peerSocketId !== socket.id
    );
    if (filteredConnectedPeersStrangers.length > 0) {
      randomStrangerSocketId =
        filteredConnectedPeersStrangers[
          Math.floor(Math.random() * filteredConnectedPeersStrangers.length)
        ];
    } else {
      randomStrangerSocketId = null;
    }
    const data = {
      randomStrangerSocketId,
    };

    io.to(socket.id).emit("stranger-socket-id", data);
  });

  socket.on("disconnect", () => {
    const newConnectedPeers = connectedPeers.filter((peerSocketId) => {
      return peerSocketId !== socket.id;
    });

    connectedPeers = newConnectedPeers;
    const newConnectedPeersStrangers = connectedPeersStrangers.filter(
      (peerSocketId) => peerSocketId !== socket.id
    );
    connectedPeersStrangers = newConnectedPeersStrangers;
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
