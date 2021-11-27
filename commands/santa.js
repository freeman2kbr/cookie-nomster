const Discord = require('discord.js')
const conn = require('../utils/conn')
const dateFormat = require('dateformat')

function join(message){
  let userId = message.author.id
  let userName = message.member.displayName
  let santaEntry = conn.existsSanta(userId)

  santaEntry.then(function(rows){
    if (rows[0]){
      message.reply(`you already is participating in the secret santa. If you would like, please use !want TEXT or !dontwant TEXT to set the things would / wouldn't like to receive.`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        })
    } else {
      conn.insertSanta(userId, userName)
      message.reply(`thank you for participating! If you would like, please use !want TEXT or !dontwant TEXT to set the things would / wouldn't like to receive.`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        })
    }
  })
}

function want(message, content){
  let userId = message.author.id
  let userName = message.member.displayName
  let santaEntry = conn.existsSanta(userId)

  santaEntry.then(function(rows){
    if (rows[0]){
      conn.updateWants(userId, userName, content.replace('!want ', ''))
      message.reply(`thanks, I got your message and saved your wants!`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        })
    } else {
      message.reply(`you haven't registered to participate in this year secret santa. Please use !joinsanta to start.`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        })
    }
  })
}

function dontWant(message, content){
  let userId = message.author.id
  let userName = message.member.displayName
  let santaEntry = conn.existsSanta(userId)

  santaEntry.then(function(rows){
    if (rows[0]){
      conn.updateDontWants(userId, userName, content.replace('!dontwant ', ''))
      message.reply(`thanks, I got your message and saved your dont wants!`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        })
    } else {
      message.reply(`you haven't registered to participate in this year secret santa. Please use !joinsanta to start.`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        })
    }
  })
}

function draw(message, client){
  if (message.member.roles.cache.find(r => r.name === "Cookie Master")) {
  } else {
    message.reply(`you are not... prepared!`)
    message.channel.send('https://i.chzbgr.com/full/9036098304/h533D74FE/access-denied')
    return
  }

  let santaList = conn.drawSanta()
  let participants = {}
  let participantNames = []
  let totalParticipants = 0
  let allSet = true
  let pairs = {}

  santaList.then(function(rows){
    totalParticipants = rows.length

    if (totalParticipants < 2){
      message.reply(`sorry Oathkeeper, you need 2 or more people participating on santa before drawing...`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        })

      return
    }

    for (let i = 0; i < totalParticipants; i++) {
      const row = rows[i];
      
      participants[row['username']] = { id: row['user_id'], wants: row['wants'], dont_wants: row['dont_wants'] }
    }

    do {
      participantNames = Object.keys(participants)
      pending = Object.keys(participants)
      allSet = true
      pairs = {}

      totalParticipants = participantNames.length

      for (let i = 0; i < totalParticipants; i++) {
        chooser = participantNames.splice(0, 1)
        randomParticipantName = null

        do {
          randomParticipant = Math.floor(Math.random() * pending.length)
          if (pending[randomParticipant] != chooser){
            randomParticipantName = pending.splice(randomParticipant, 1)
          } else if (pending.length === 1) {
            allSet = false
            break
          }
        } while (randomParticipantName === null)

        pairs[chooser] = randomParticipantName
      }
    } while (!allSet)
 
    participantNames = Object.keys(participants)
    totalParticipants = participantNames.length
  
    summary = `**Secret Santa Draw - ${ dateFormat(new Date(), 'mmmm, d - yyyy') }**\n\n`
    summary += `Pairs: \n`
    naughtyList = `\n\n** Wants / Don't Wants:\n\n`
  
    for (let i = 0; i < totalParticipants; i++) {
      chooser = participantNames[i]
      pair = pairs[chooser][0]
      chooserDetails = participants[chooser]

      summary += `${ chooser } - ${ pair }\n`
      
      naughtyList += `${ chooser }\n`
      naughtyList += `Wants: ${ chooserDetails['wants'] ? chooserDetails['wants'] : '' }\n`
      naughtyList += `Don't wants: ${ chooserDetails['dont_wants'] ? chooserDetails['dont_wants'] : '' }\n\n`

      sendDetailsToDM(client, participants, chooser, pair)
    }
  
    summary += naughtyList

    webhookClient = new Discord.WebhookClient('833441875461275658', 'rxTBKAiJMszEcRZNw4-HzpifRG2as5Fw5Gpb4o8QFiVPdu9FwXUm7G8OZKaKiD0Cvv8q')
    webhookClient.send(summary)
    console.log(summary)
    
    message.reply('santa draw completed. Please check your private discord for the summary.')
  }) 
}

function sendDetailsToDM(client, participants, chooser, pair){
  new Promise(() => {
    let chooserDetails = participants[chooser]
    let pairDetails = participants[pair]
    let dmContent = `Hello! It's your friend Cookie Nomster with your secret santa \\o/`
    dmContent += `\n\nYour secret santa is: ${ pair }`
    dmContent += `\nHe would like to receive: ${ pairDetails['wants'] ? pairDetails['wants'] : '' }`
    dmContent += `\nHe would NOT like to receive: ${ pairDetails['dont_wants'] ? pairDetails['dont_wants'] : '' }`
    dmContent += `\n\nIf you have any question, poke Othelia!`

    client.users.fetch(chooserDetails['id'], false).then((user) => { user.send(dmContent) })
  }).catch(error => { console.log(error) })
}

function reset(message){
  if (message.member.roles.cache.find(r => r.name === "Cookie Master")) {
    message.reply(`access level acknowledged. Resetting santa!`)
    conn.resetSanta()
    message.channel.send('Santa reset complete.')
  } else {
    message.reply(`you are not... prepared!`)
    message.channel.send('https://i.chzbgr.com/full/9036098304/h533D74FE/access-denied')
  }
}

module.exports = {
  join,
  want,
  dontWant,
  draw,
  reset
}