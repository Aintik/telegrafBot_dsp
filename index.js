const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const mongoose = require("mongoose")
const Order = require("./models/order");
const { URL, bot_token } = process.env;
const PORT = process.env.PORT || 5000;
const bot = new Telegraf(bot_token);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));



bot.catch((err, ctx) => {
  console.log('err occured', err);
})


// Главное меню
bot.start((ctx) => {
  ctx.reply(
    '👋 Добро пожаловать в *DSP Optom*! Выберите действие:',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📦 Каталог', 'catalog')],
        [Markup.button.callback('📞 Контакты', 'contacts')],
        [Markup.button.callback('📝 Сделать заказ', 'order')]
      ])
    }
  );
});

// Каталог
bot.action('catalog', (ctx) => {
  ctx.reply(
    '📦 Каталог:\n\n1️⃣ ДСП 16 мм — 250 листов\n2️⃣ ДСП 18 мм — 300 листов\n\nВыберите категорию:',
    Markup.inlineKeyboard([
      [Markup.button.callback('16 мм', 'cat_16')],
      [Markup.button.callback('18 мм', 'cat_18')],
      [Markup.button.callback('⬅️ Назад', 'back_home')]
    ])
  );
});

bot.action('cat_16', (ctx) => ctx.reply('Вы выбрали ДСП 16 мм.'));
bot.action('cat_18', (ctx) => ctx.reply('Вы выбрали ДСП 18 мм.'));
bot.action('back_home', (ctx) => ctx.reply('Возврат в главное меню. Напишите /start.'));

// Контакты
bot.action('contacts', (ctx) => {
  ctx.reply('📞 Контакты:\n\nТелефон: +998 90 123 45 67\nАдрес: Ташкент, ул. Промышленная 12');
});

// Заказ
let orderData = {};

bot.action('order', (ctx) => {
  ctx.reply('Введите ваш номер телефона:');
  orderData[ctx.chat.id] = { step: 'phone' };
});


// 🧠 Команда /orders для администратора
bot.command("orders", async (ctx) => {
  const admins = process.env.ADMINS.split(",").map((i) => i.trim());
  if (!(admins.find((i) => {
    return i == ctx.from.id;
  }))) {
    return ctx.reply("🚫 У вас нет доступа к этой команде.");
  }

  const orders = await Order.find().sort({ createdAt: -1 }).limit(10);

  if (!orders.length) {
    return ctx.reply("Пока нет заказов.");
  }

  let message = "📋 *Последние заказы:*\n\n";
  orders.forEach((o, i) => {
    message += `#${i + 1}\n👤 @${o.username || "—"}\n📞 ${o.phone}\n📦 ${o.quantity} листов (${o.category})\n🕒 ${o.createdAt.toLocaleString()}\n\n`;
  });

  ctx.reply(message);
});




bot.on('text', async (ctx) => {
  const user = orderData[ctx.chat.id];
  if (!user) return;

  if (user.step === 'phone') {
    user.phone = ctx.message.text;
    user.step = 'quantity';
    ctx.reply('Введите количество листов:');
  } else if (user.step === 'quantity') {
    user.quantity = ctx.message.text;
    user.step = 'category';
    ctx.reply('Укажите категорию (например: 16 мм или 18 мм):');
  } else if (user.step === 'category') {
    user.category = ctx.message.text;
    

    const newOrder = new Order({
      username: ctx.from.username,
      phone: user.phone,
      quantity: user.quantity,
      category: user.category
    });
    await newOrder.save();

    ctx.reply('✅ Заказ успешно сохранён! Мы скоро свяжемся с вами.');

    delete orderData[ctx.chat.id];
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