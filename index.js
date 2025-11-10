const {Telegraf} = require("telegraf")
require("dotenv").config();
const bot = new Telegraf(process.env.bot_token);

bot.use(async (ctx, next) => {
  ctx.state.isSent = true;
  await next(ctx)
});
bot.catch((err, ctx) => {
  console.log('err occured', err);
})

bot.start(ctx => ctx.reply('bot started'));
bot.help(ctx=>ctx.reply('list of commands'))
bot.settings(ctx => ctx.reply('settings'))
bot.command(["stop", "finish"], (ctx) => {
  ctx.reply("stop command");
});
bot.mention('botfather', ctx=>ctx.reply("bot father is mentioned"))
bot.phone("+380991231231", ctx => ctx.reply("phone num"))
bot.hashtag("botHash", ctx => ctx.reply("hashtaged"))
bot.command('ctx', ctx => {
  ctx.reply(`Hello, ${ctx.update.message.from.first_name}. State ${ctx.state.isSent}`);
});
bot.hears('dog', (ctx) => {
  ctx.reply('who lets the dog out')
});
//bot.on(["message", "edited_message"], (ctx) => {
//  console.log(ctx.updateType);
//  console.log(ctx.update);
//});




bot.launch().then((res) => {
  console.log("bot is running✅✅✅");
}).catch(err=>console.log(err));