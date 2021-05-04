const conn = require('../utils/conn')
const zeroPad = (num, places) => String(num).padStart(places, '0')
const failurePhrases = [
  `you tried your best but your sleezy hands couldn't open the cookie jar lid.`,
  `nice try, but Othelia caught you sneaking around the pantry.`,
  `you try, but you get scared when someone yells behind you: _...the AUDACITY!_`,
  `you move stealthily as a cat, carefully not to make any sound, only to slip in a banana peel and hit the cabinet full of pans. You end up waking up the entire FC house.`,
  `you reach out for the cookie jar only to find a note: "Sorry, the cookie jar is in another FC house."`,
  `you tried to steal some cookies but you're acting sus and someone saw you vent.`,
  `you've been caught trying to steal cookies. Go directly to FC dungeon, do not pass by your retainers and do not collect 200 gil.`, // Cali
  `it's dark and you can't see right, instead of stealing cookies, you hand was caught in the grip of a lobster's pincers. You tried stealing cookies from the aquarium.`, // Mel and Tria
  `as you're about to steal some cookies, a stranger with a very interesting glamour catches your eye. When you look back, your target has disappeared into the crowd.`, // Kay
  `you reach for the cookie, but Master Matoya whacks your hand with her staff to punish your attempt to steal the cookie.`, // Mel
  `you reached and all you got was 2 days locked in a room, alone, with Vissik in a speedo.`, // Vissik
  `you try to reach for the cookie on the shelf, but are forced to run when all of a sudden, you are surrounded by all the lalafell in the FC, looking at you with blank, creepy eyes, in a sort of ritualistic circle around you.`, // Mel
  `you try to reach for the cookie on the shelf, but you are knocked out, finding yourself as another of Akio's pimping business.`, // Mel
  `you reach for the cookie jar, only for the jar to slip onto your head, revealing that Meline has replaced it with winnie the pooh's jar of honey instead.`, // Mel
  `you reach for the cookie on the shelf, but fall and break your spine, you are healed by Raphtalia who bills you for an exorbitant amount, you are a now one of her debt slaves.`, // Mel
  `after successfully sneaking into the kitchen, you go for the cookies only to find righteousness himself, Vauthry, eating the last one and hungry for more.` // Cali
]

function dailyCookies(message){
  let userId = message.author.id
  let userName = message.member.displayName
  let currentTotal = conn.selectTotalCookies(userId)

  currentTotal.then(function(rows){
    newCookies = getRandom(16, 26);
    updatedTotal = newCookies
    cookieAvailable = true
    
    if (rows[0]){
      updatedTotal += rows[0]['total']
      lastCookieAt = new Date(rows[0]['updated_at'])
      cookieRefreshAt = new Date(lastCookieAt.getTime() +  24 * 1000 * 60 * 60);
    } else {
      cookieRefreshAt = new Date()
    }

    if (cookieRefreshAt > new Date()){
      timeDifference = Math.abs(cookieRefreshAt.getTime() - new Date().getTime());
      hours = Math.floor(timeDifference / (1000 * 60 * 60));
      minutes = Math.floor((timeDifference / (1000 * 60 * 60) - hours) * 60);
      seconds = Math.floor((((timeDifference / (1000 * 60 * 60)  - hours) * 60) - minutes) * 60);

      message.reply(`it's too soon to get more cookies. You need to wait **${ zeroPad(hours, 2) }h${ zeroPad(minutes, 2) }** for another set straight from the oven.`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        });

      return;
    }
    
    conn.updateCookies(userId, userName, updatedTotal)

    message.reply(`you have received ${ newCookies } cookies :cookie:`)
  })
}

function leaderboard(message){
  let top15 = conn.selectTop15()

  top15.then(function(rows){
    content = '**===== Cookie Leaderboard =====**\n\n'

    for (let i = 0; i < rows.length; i++) {
      row = rows[i]
      userName = row['username']
      content += `**${ i + 1 } - ${ userName }**\n`
      content += `${ row['total'] } cookies\n\n`
    }

    message.channel.send(content)
  })
}

function giveCookies(message){
  let userId = message.author.id
  let userName = message.member.displayName  
  let currentTotal = conn.selectTotalCookies(userId)

  if (!message.mentions.members.first()){
    message.reply(`you need to tell me who should be getting your cookies.`)
      .then(msg => {
        msg.delete({ timeout: 10000 })
        message.delete({ timeout: 10000 })
      })

    return
  }
  
  let giftedUserName = message.mentions.members.first().displayName
  let giftedUserId = message.mentions.members.first().user.id
  let giftedUserCurrentTotal = conn.selectTotalCookies(giftedUserId)

  if (userId === giftedUserId){
    message.reply(`you can't gift yourself, you're on a diet.`)
      .then(msg => {
        msg.delete({ timeout: 10000 })
        message.delete({ timeout: 10000 })
      })

    return
  }

  currentTotal.then(function(rows){
    if (rows[0]){
      availableCookies = rows[0]['total']

      if (availableCookies < 26) {
        message.reply(`you don't have enough cookies in your jar to give away.`)
          .then(msg => {
            msg.delete({ timeout: 10000 })
            message.delete({ timeout: 10000 })
          })

        return
      }

      cookiesToGive = getRandom(16, 26);
      updatedTotal = availableCookies - cookiesToGive
      conn.updateCookiesQuantityOnly(userId, userName, updatedTotal)

      giftedUserCurrentTotal.then(function(giftRows){
        if (giftRows[0]){
          cookiesToGive += giftRows[0]['total']
        }
      
        conn.updateCookiesQuantityOnly(giftedUserId, giftedUserName, cookiesToGive)
      })
    } else {
      message.reply(`you don't have enough cookies in your jar to give away.`)
        .then(msg => {
          msg.delete({ timeout: 10000 })
          message.delete({ timeout: 10000 })
        })

      return
    }

    message.reply(`gave ${ cookiesToGive } cookies to ${ giftedUserName } :cookie:`)
    return
  })
}

function stealCookies(message){
  let userId = message.author.id
  let userName = message.member.displayName
  let userData = conn.selectTotalCookies(userId)
  let userTotal = 0
  let hitOrMiss = Math.random()

  if (!message.mentions.members.first()){
    message.reply(`you need to tell me who you are trying to steal cookies from.`)
      .then(msg => {
        msg.delete({ timeout: 10000 })
        message.delete({ timeout: 10000 })
      })

    return
  }
  
  let victimUserName = message.mentions.members.first().displayName
  let victimUserId = message.mentions.members.first().user.id
  let victimUserCurrentTotal = conn.selectTotalCookies(victimUserId)

  if (userId === victimUserId){
    message.reply(`you can't steal from yourself, you're the worse criminal ever and would probably end up calling police on yourself.`)
      .then(msg => {
        msg.delete({ timeout: 10000 })
        message.delete({ timeout: 10000 })
      })

    return
  }

  if (hitOrMiss < 0.7) {
    message.reply(failurePhrases[Math.floor(Math.random() * failurePhrases.length)])
    return;
  }

  userData.then(function(rows){
    if (rows[0]){
      userTotal = rows[0]['total']
    }
  
    victimUserCurrentTotal.then(function(victimRows){
      if (victimRows[0]){
        availableCookies = victimRows[0]['total']

        if (availableCookies < 26) {
          message.reply(`you can't steal from a jar that is basically empty. It would be too cruel.`)
          return
        }

        cookiesToSteal = getRandom(16, 26);
        
        if (hitOrMiss < 0.9){
          cookiesToLose = getRandom(5, 13);
          userTotal -= cookiesToLose
          conn.updateCookiesQuantityOnly(userId, userName, userTotal)

          message.reply(`you did your best but while trying to steal, some of your own cookies fell from your pocket. You lost ${ cookiesToLose } cookies.`)
          return
        } else {
          victimTotal = availableCookies - cookiesToSteal
          conn.updateCookiesQuantityOnly(victimUserId, victimUserName, victimTotal)
          userTotal += cookiesToSteal
          conn.updateCookiesQuantityOnly(userId, userName, userTotal)

          message.reply(`you outdid yourself and like the mastermind criminal you are, you stole ${ cookiesToSteal } cookies. What kind of person would do something so terrible?`)
          return
        }
      } else {
        message.reply(`you don't have enough cookies in your jar to give away.`)
          .then(msg => {
            msg.delete({ timeout: 10000 })
            message.delete({ timeout: 10000 })
          })

        return
      }
    })
  })
}

function resetLeaderboard(message){
  if (message.member.roles.cache.find(r => r.name === "Cookie Master")) {
    message.reply(`access level acknowledged. Resetting leaderboard!`)
    conn.resetCookies()
    message.channel.send('Leaderboard reset complete.')
  } else {
    message.reply(`you are not... prepared!`)
    message.channel.send('https://i.chzbgr.com/full/9036098304/h533D74FE/access-denied')
  }
}

function getRandom(minNumber, maxNumber) {
  return Math.floor(Math.random() * (maxNumber - minNumber) + minNumber) //The maximum is exclusive and the minimum is inclusive
}

module.exports = {
  dailyCookies,
  leaderboard,
  giveCookies,
  stealCookies,
  resetLeaderboard
}