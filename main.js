const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const request = require('request');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],});
// When the client is ready, run this code (only once)
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
//view message on console vscode
client.on('messageCreate', m => {
	if(m.author.bot) return;
	console.log(m)
});

client.on('messageCreate', async message => {
    const channel = client.channels.cache.get(message.channelId)
    if(message.content.includes('!wallet')) {
        const splitWallet = message.content.split(" ", 2)
        var wallet = splitWallet[1];
        const walletAPI = `https://crypto.org/explorer/api/v1/accounts/${wallet}`;
        request.get(walletAPI, function(error,response,body){
            const json = JSON.parse(body);
            try {
                    console.log(json);
                    var total = (json['result']['totalBalance'][0]['amount']/100000000).toFixed(2).toString();
                    var balance = (json['result']['balance'][0]['amount']/100000000).toFixed(2).toString();
                    var bondedBalance = (json['result']['bondedBalance'][0]['amount']/100000000).toFixed(2).toString();
                    var rewards = (json['result']['totalRewards'][0]['amount']/100000000).toFixed(2).toString();
                    const embed = new EmbedBuilder()
                        .setTitle('CRO Wallet')
                        .setColor(0x6FB5EE)
                        .addFields(
                            { name: 'Wallet Total', value: total },
                            { name: 'Current Balance', value: balance },
                            { name: 'Bonded Balance', value: bondedBalance },
                            { name: 'Total Rewards', value: rewards }
                        );
                    message.reply({embeds: [embed]});
            } catch {
                channel.send('Please input a valid CRO Wallet Address.')
            }
        });
    } else if(message.content.includes('!val')) {
        const splitValidator = message.content.split(" ", 2)
        const validator = splitValidator[1];
        const validatorAPI = `https://crypto.org/explorer/api/v1/validators/${validator}?recentBlocks=100`;
        request.get(validatorAPI, function(error,response,body){
            const json = JSON.parse(body)
            try {
                var nodeAddress = json['result']['consensusNodeAddress'];
                var status = json['result']['status'];
                var power = json['result']['power'];
                var validatorName = json['result']['moniker'];
                var website = json['result']['website'];
                var contact = json['result']['securityContact'];
                var description = json['result']['details'];
                var comRate = json['result']['commissionRate'];
                var comMaxRate = json['result']['commissionMaxRate'];
                var comChangeRate = json['result']['commissionMaxChangeRate'];
                var impreciseUpTime = json['result']['impreciseUpTime'];
    
                comRate = ((parseFloat(comRate))*100).toFixed(2).toString() + '%';
                comMaxRate = ((parseFloat(comMaxRate))*100).toFixed(2).toString() + '%';
                comChangeRate = ((parseFloat(comChangeRate))*100).toFixed(2).toString() + '%';
    
                const embed = new EmbedBuilder()
                    .setTitle(validatorName)
                    .setDescription(description)
                    .setColor(0xFFFFFF)
                    .addFields(
                        { name: 'Contact', value: contact, inline: true },
                        { name: 'Website', value: (`[${website}](https://${website})`), inline: true },
                        { name: 'Node Address', value: nodeAddress },
                        { name: 'Power', value: power, inline: true },
                        { name: 'Status', value: status, inline: true },
                        { name: 'Imprecise Up Time', value: impreciseUpTime, inline: true },
                        { name: 'Commission Rate', value: comRate, inline: true },
                        { name: 'Max Rate', value: comMaxRate, inline: true },
                        { name: 'Change Rate', value: comChangeRate, inline: true },
                    )
                message.reply({embeds: [embed]});
            } catch {
                channel.send('Please input a valid Validator Address.')
            }
        });
    } else if(message.content.includes('!list')){
        const validatorList = `https://crypto.org/explorer/api/v1/validators?pagination=offset&page=1&limit=100&order=power.desc`;
        request.get(validatorList,function(error,response,body){
            const json = JSON.parse(body);
            var msg = '';
            var length = json['result'].length
            for(i = 0; i < length; i++){
                msg += json['result'][i]['moniker'] + ' - ' + json['result'][i]['operatorAddress'] + '\n';
                if(msg.length >= 1500) {
                    channel.send('```' + msg + '```');
                    msg = '';
                }
            }
            if(msg.length != 0) {
                channel.send('```' + msg + '```');
            }
        }) 
    }
})

//Login to Discord with your bot's token
client.login(token);
