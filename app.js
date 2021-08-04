require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const schedule = require('node-schedule')
const fs = require('fs')

fs.readdir('./events/', (err, files) => {
  files.forEach(file => {
    const eventHandler = require(`./events/${file}`)
    const eventName = file.split('.')[0]
    client.on(eventName, (...args) => eventHandler(client, ...args))
  })
})

client.login(process.env.BOT_TOKEN)

console.log(`Logged in!`)

schedule.scheduleJob('0 4 * * *', function(){
  const conn = require('./utils/conn')
  conn.freshCookies()
  console.log(`Cookies refreshed. ${ new Date().toLocaleString() }`)
})