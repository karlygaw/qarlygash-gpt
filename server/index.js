const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const PORT = 8000
require('dotenv').config()
mongoose.set('strictQuery', false);
const API_KEY = process.env.API_KEY
const app = express();
const Chat = require("./model/chatModel");


mongoose
  .connect("mongodb://127.0.0.1:27017/jwt", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });



app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
app.use("/", authRoutes);
app.use(cors())

app.post('/completions', async (req, res) => {
  const { message } = req.body;
  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.body.message }],
      max_tokens: 100,
    })
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', options)
    const data = await response.json()

    // Извлекаем роль из сообщения пользователя
    const userRole = data.choices[0].message.role;

    const newChatMessage = new Chat({
      title: userRole, // Используем роль пользователя в качестве заголовка
      role: userRole,
      content: data.choices[0].message.content,
    });

    await newChatMessage.save();

    res.send(data)
  } catch (error) {
    console.error(error)
  }
})

app.listen(PORT, () => console.log('Your server is running on Port: ' + PORT))
