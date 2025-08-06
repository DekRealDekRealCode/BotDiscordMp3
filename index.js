require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { uploadToSupabase } = require("./supabase");
require("./keepalive");

const client = new Client({
  intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
  partials: ["CHANNEL"],
});

client.on("ready", () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.guild) return;

  const url = message.content.trim();
  if (!ytdl.validateURL(url)) {
    return message.reply("❌ กรุณาส่งลิงก์ YouTube ที่ถูกต้อง");
  }

  const info = await ytdl.getInfo(url);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, "").slice(0, 40);
  const mp3Path = path.join(__dirname, "downloads", `${title}.mp3`);
  const mp4Path = path.join(__dirname, "downloads", `${title}.mp4`);

  message.reply("⏳ กำลังแปลงไฟล์...");

  // MP3
  ffmpeg(ytdl(url, { filter: "audioonly" }))
    .setFfmpegPath(require("ffmpeg-static"))
    .audioBitrate(128)
    .save(mp3Path)
    .on("end", async () => {
      const mp3Url = await uploadToSupabase(mp3Path, `mp3/${title}.mp3`, "audio/mpeg");
      fs.unlinkSync(mp3Path);
      if (mp3Url) {
        await message.author.send(`🎵 MP3 พร้อมดาวน์โหลด: ${mp3Url}`);
      }
    });

  // MP4
  ffmpeg(ytdl(url, { quality: "highestvideo" }))
    .setFfmpegPath(require("ffmpeg-static"))
    .save(mp4Path)
    .on("end", async () => {
      const mp4Url = await uploadToSupabase(mp4Path, `mp4/${title}.mp4`, "video/mp4");
      fs.unlinkSync(mp4Path);
      if (mp4Url) {
        await message.author.send(`🎥 MP4 พร้อมดาวน์โหลด: ${mp4Url}`);
      }
    });
});

client.login(process.env.DISCORD_TOKEN);
