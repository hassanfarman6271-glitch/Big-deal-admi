require("dotenv").config();

const express = require("express");
const app = express();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  ActivityType
} = require("discord.js");

// =====================================
// EXPRESS SERVER (RENDER FIX)
// =====================================

app.get("/", (req, res) => {
  res.send("BIG DEAL ADMIN ONLINE");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server Running On Port ${PORT}`);
});

// =====================================
// CLIENT
// =====================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

// =====================================
// READY EVENT
// =====================================

client.once("ready", async () => {
  console.log(`🤖 ${client.user.tag} is Online`);

  client.user.setPresence({
    activities: [
      {
        name: "BIG DEAL SECURITY",
        type: ActivityType.Watching
      }
    ],
    status: "online"
  });

  // =====================================
  // SLASH COMMANDS
  // =====================================

  const commands = [

    new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Check bot ping"),

    new SlashCommandBuilder()
      .setName("say")
      .setDescription("Send message")
      .addStringOption(option =>
        option
          .setName("text")
          .setDescription("Message")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("announce")
      .setDescription("Send announcement")
      .addStringOption(option =>
        option
          .setName("text")
          .setDescription("Announcement")
          .setRequired(true)
      )

  ].map(cmd => cmd.toJSON());

  const rest = new REST({
    version: "10"
  }).setToken(process.env.TOKEN);

  try {

    console.log("🔄 Refreshing Slash Commands");

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log("✅ Slash Commands Loaded");

  } catch (err) {
    console.log(err);
  }
});

// =====================================
// INTERACTION CREATE
// =====================================

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  try {

    // =================================
    // PING
    // =================================

    if (interaction.commandName === "ping") {

      await interaction.reply({
        content: "🏓 Pong!",
        ephemeral: false
      });

    }

    // =================================
    // SAY
    // =================================

    if (interaction.commandName === "say") {

      const text =
        interaction.options.getString("text");

      await interaction.reply({
        content: "✅ Message Sent",
        ephemeral: true
      });

      await interaction.channel.send(text);
    }

    // =================================
    // ANNOUNCE
    // =================================

    if (interaction.commandName === "announce") {

      const text =
        interaction.options.getString("text");

      await interaction.reply({
        content: "📢 Announcement Sent",
        ephemeral: true
      });

      await interaction.channel.send({
        content: `📢 **ANNOUNCEMENT**\n\n${text}`
      });
    }

  } catch (err) {

    console.log(err);

    // =================================
    // ERROR FIX
    // =================================

    if (
      interaction.replied ||
      interaction.deferred
    ) {

      await interaction.followUp({
        content:
          "❌ Error While Executing Command",
        ephemeral: true
      });

    } else {

      await interaction.reply({
        content:
          "❌ Error While Executing Command",
        ephemeral: true
      });
    }
  }
});

// =====================================
// LOGIN
// =====================================

client.login(process.env.TOKEN);
