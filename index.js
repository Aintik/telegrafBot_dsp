const {Telegraf} = require("telegraf")
require("dotenv").config();
const mongoose = require("mongoose")
const Order = require("./models/order")
const { URL, bot_token } = process.env;
const PORT = process.env.PORT || 5000;
const bot = new Telegraf(bot_token);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

//bot.use(async (ctx, next) => {
//  ctx.state.isSent = true;
//  await next(ctx)
//});
bot.catch((err, ctx) => {
  console.log('err occured', err);
})

// is user in Order State?
const userStates = new Map();


bot.start((ctx) => {
  userStates.delete(ctx.from.id); // Reset state
  ctx.reply(
    '👋 Добро пожаловать в "DSP Optom"! Мы продаём ДСП оптом. Напиши /catalog чтобы посмотреть товары.'
  );
});
bot.help(ctx => {
  userStates.delete(ctx.from.id); // Reset state
  ctx.reply("Это бот для просмотра дсп и покупки");
});
bot.command("catalog", (ctx) => {
  userStates.delete(ctx.from.id); // Reset state
  ctx.reply(
    "📦 Каталог:\n1. ДСП 16 мм — 250 листов в наличии\n2. ДСП 18 мм — 300 листов\n\nДля заказа напишите: /order"
  );
});
bot.command("order", (ctx) => {
  userStates.set(ctx.from.id, "awaiting_order");
  ctx.reply(
    "📝 Отправьте, пожалуйста, ваш номер телефона и желаемое количество листов."
  );
});

bot.on("text", (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username
   if (userStates.get(userId) === "awaiting_order") {
     userStates.delete(userId);
     ctx.reply(
       "✅ Спасибо за заказ! Мы скоро с вами свяжемся для подтверждения."
     );
     console.log(
       `New order from user ${(userId, username)}: ${ctx.message.text}`
     );
   } else {
     ctx.reply(
       "Для просмотра товаров напишите /catalog\nДля оформления заказа напишите /order"
     );
   }
});





if (process.env.NODE_ENV === "production") {
  bot.telegram.setWebhook(`${URL}/bot${bot_token}`);
  bot.startWebhook(`/bot${bot_token}`, null, PORT);
  console.log("Started with webhook✅");
} else {
  bot.launch()
  console.log("bot is running✅✅✅");
}