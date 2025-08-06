const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("download")
    .setDescription("แปลง YouTube เป็น MP3 และ MP4")
    .addStringOption(option =>
      option.setName("link")
        .setDescription("ลิงก์ YouTube")
        .setRequired(true)
    )
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🚀 Registering slash command...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash command deployed!");
  } catch (err) {
    console.error(err);
  }
})();
