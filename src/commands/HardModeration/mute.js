const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Times out a server member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user you would like to time out')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('duration')
        .setDescription('The duration of the timeout (e.g. 1s, 1m, 1h, 1d, 1w)')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for timing out the user')
        .setRequired(false)
    ),
  async execute(interaction, client) {

        const timeUser = interaction.options.getUser('target');
        const timeMember = await interaction.guild.members.fetch(timeUser.id);
        const channel = interaction.channel;
        const duration = interaction.options.getString('duration');
        const user = interaction.options.getUser('user') || interaction.user;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: `${client.config.noPerms}`, ephemeral: true})
        if (!timeMember) return await interaction.reply({ content: 'The **user** mentioned is no longer within the server.', ephemeral: true})
        if (!timeMember.kickable) return interaction.reply({ content: 'I **cannot** timeout this user! This is either because their **higher** then me or you.', ephemeral: true})
        if (!duration) return interaction.reply({content: 'You **must** set a valid duration for the timeout', ephemeral: true})
        if (interaction.member.id === timeMember.id) return interaction.reply({content: "You **cannot** use the \`\`mute\`\` command on yourself...", ephemeral: true})
        if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({content: "You **cannot** timeout staff members or people with the Administrator permission!", ephemeral: true})

        let reason = interaction.options.getString('reason');
        if (!reason) reason = "\`\`Reason for timeout not given\`\`"

        await timeMember.timeout(duration * 1000, reason)

            const minEmbed = new EmbedBuilder()
            .setColor(client.config.embedModHard)
            .setAuthor({ name: `${client.user.username} timeout command ${client.config.devBy}`})
            .setTitle(`> ${client.config.modEmojiHard}  User was **timed-out** in "${interaction.guild.name}"  ${client.config.arrowEmoji}`)
            .addFields({ name: 'User', value: `> ${user.tag}`, inline: true})
            .addFields({ name: 'Reason', value: `> ${reason}`, inline: true})
            .addFields({ name: 'Duration', value: `> ${duration / 60}`, inline: true})
            .setThumbnail(client.user.avatarURL())
            .setFooter({ text: `Someone was muted`})
            .setTimestamp()

            const dmEmbed = new EmbedBuilder()
            .setColor(client.config.embedModHard)
            .setAuthor({ name: `${client.user.username} timeout Tool`})
            .setTitle(`> ${client.config.modEmojiHard}  You were **timed-out** in "${interaction.guild.name}"  ${client.config.arrowEmoji}`)
            .addFields({ name: 'Server', value: `> ${interaction.guild.name}`, inline: true})
            .addFields({ name: 'Reason', value: `> ${reason}`, inline: true})
            .addFields({ name: 'Duration', value: `> ${duration / 60}`, inline: true})
            .setFooter({ text: `Timed-out from ${interaction.guild.name} ${client.config.devBy}`})
            .setTimestamp()
            .setThumbnail(client.user.avatarURL())

            await timeMember.send({ embeds: [dmEmbed] }).catch((err) => { return client.logs.error('[MUTE] Failed to DM user.') });
            await interaction.reply({ embeds: [minEmbed] })
    },
}