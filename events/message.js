const cookies = require('../commands/cookies')
const santa = require('../commands/santa')

module.exports = (client, message) => {
  content = message.content

  if (content === '!ping'){
    message.reply('Pong!')
  } else if (content === '!score' || content === '?cooldr'){
    cookies.leaderboard(message)
  } else if (content === '!cookie' || content === '?dailycookies' || content === '!c' || content === '!cookies'){
    cookies.dailyCookies(message)
  } else if (content.startsWith('!givecookies') || content.startsWith('?givecookies')){
    cookies.giveCookies(message)
  } else if (content.startsWith('!stealcookies') || content.startsWith('?stealcookies')){
    cookies.stealCookies(message)
  } else if (content === '!resetleaderboard' || content === '!resetscore'){
    cookies.resetLeaderboard(message)
  } else if (content === '!joinsanta'){
    santa.join(message)
  } else if (content.startsWith('!want')){
    santa.want(message, content)
  } else if (content.startsWith('!dontwant')){
    santa.dontWant(message, content)
  } else if (content === '!drawsanta'){
    santa.draw(message, client)
  } else if (content === '!resetsanta'){
    santa.reset(message, client)
  } else if (content === '!mogstationgift'){
    message.reply(`Here Othelia, this code is valid for one use only, don't share with multiple people.\n\n http://tinyurl.com/mogstation-code`)
  } else if (content === '!help'){
    help = `Welcome to CASTL private bot - Cookie Nomster!\n\n`
    help += `Right now I accept a few commands only:\n\n`
    help += ` !score - show cookie leaderboard\n`
    help += ` !cookie - give you cookies daily\n`
    help += ` !givecookies @user - give some of your cookies to another person\n`
    help += ` !stealcookies @user - tries to steal cookies from another person\n`
    help += ` !joinsanta - join our annual secret santa\n`
    help += ` !want TEXT - adds a list of things you want to help your secret santa decide\n`
    help += ` !dontwant TEXT - adds a list of things you DON'T want to help your secret santa decide\n\n`
    help += `Things you shouldn't do unless you're Othelia:\n\n`
    help += ` !mogstationgift - creates a mogstation valid gift code\n`
    help += ` !resetscore - resets cookies leaderboard\n`
    help += ` !resetsanta - resets secret santa list\n`
    help += ` !drawsanta - draws secret santa pairs and send a summary\n`

    message.channel.send(help, { code: true });
  }
}