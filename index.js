const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const mongoose = require("mongoose")
const Order = require("./models/order");
const { URL, bot_token } = process.env;
const PORT = process.env.PORT || 5000;
const admins = process.env.ADMINS.split(",").map((i) => i.trim());
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
bot.help(ctx=>ctx.reply("Бот для заказов дсп"))

// Каталог
bot.action('catalog', (ctx) => {
  ctx.reply(
    '📦 Каталог:\n\n1️⃣ ДСП "МОСКОВСКИЙ" — 1750*3500*16 мм\n2️⃣ ДСП "МУРОМ" — 1750*3500*16 мм\n1️⃣ ДСП "ПЕРМЬ" — 1700*2745*2,5 мм\n\nВыберите категорию:',
    Markup.inlineKeyboard([
      [Markup.button.callback("16 мм", "cat_16")],
      [Markup.button.callback("18 мм", "cat_18")],
      [Markup.button.callback("⬅️ Назад", "back_home")],
    ])
  );
});
bot.command("catalog", (ctx) => {
  ctx.reply(
    "📦 Каталог:\n\n1️⃣ ДСП 16 мм — 250 листов\n2️⃣ ДСП 18 мм — 300 листов\n\nВыберите категорию:",
    Markup.inlineKeyboard([
      [Markup.button.callback("16 мм", "cat_16")],
      [Markup.button.callback("18 мм", "cat_18")],
      [Markup.button.callback("⬅️ Назад", "back_home")],
    ])
  );
});

bot.action('cat_16', (ctx) => {
  ctx.reply("Вы выбрали ДСП 16 мм.", {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("📝 Сделать заказ", "order")],
    ]),
  });
});
  bot.action("cat_18", (ctx) => {
    ctx.reply("Вы выбрали ДСП 18 мм.", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("📝 Сделать заказ", "order")],
      ]),
    });
  });
bot.action('back_home', (ctx) => {
  ctx.reply("👋Выберите действие:", {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("📦 Каталог", "catalog")],
      [Markup.button.callback("📞 Контакты", "contacts")],
      [Markup.button.callback("📝 Сделать заказ", "order")],
    ]),
  });
});

// Контакты
bot.action("contacts", (ctx) => {
  ctx.reply(
    "📞 *Контакты:*\n\n" +
      "📱 Телефон: +998 99 830 04 06\n" +
      "📍 Адрес: Ташкент, Зангиота тумани, Охакчилар кочаси 20\n" +
      "📸 Инстаграм: [dsp_moskovskiy](https://www.instagram.com/dsp_moskovskiy)\n" +
      "📢 Телеграм-канал: [DSP Moskovskiy](https://t.me/dspmoskovskiy)",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💬 Написать", "https://t.me/+998998300406")],
        [Markup.button.callback("⬅️ Назад", "back_home")],
      ]),
    }
  );
});
bot.command("contacts", (ctx) => {
  ctx.reply(
    "📞 *Контакты:*\n\n" +
      "📱 Телефон: +998 99 830 04 06\n" +
      "📍 Адрес: Ташкент, Зангиота тумани, Охакчилар кочаси 20\n" +
      "📸 Инстаграм: [dsp_moskovskiy](https://www.instagram.com/dsp_moskovskiy)\n" +
      "📢 Телеграм-канал: [DSP Moskovskiy](https://t.me/dspmoskovskiy)",
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.url("💬 Написать", "https://t.me/+998998300406")],
        [Markup.button.callback("⬅️ Назад", "back_home")],
      ]),
    }
  );
});

// Заказ
let orderData = {};

bot.action('order', (ctx) => {
  if (orderData[ctx.chat.id]) delete orderData[ctx.chat.id];

  ctx.reply(
    "📞 Пожалуйста, поделитесь вашим номером телефона или введите его вручную:",
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: "📱 Отправить мой номер телефона",
              request_contact: true, 
            },
          ],
          ["❌ Отмена"],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );

  orderData[ctx.chat.id] = { step: "phone" };
});
bot.command("order", (ctx) => {
  if (orderData[ctx.chat.id]) delete orderData[ctx.chat.id];

  ctx.reply(
    "📞 Пожалуйста, поделитесь вашим номером телефона или введите его вручную:",
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: "📱 Отправить мой номер телефона",
              request_contact: true,
            },
          ],
          ["❌ Отмена"],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );

  orderData[ctx.chat.id] = { step: "phone" };
});
bot.on("contact", (ctx) => {
  const contact = ctx.message.contact;
  const chatId = ctx.chat.id;

  // Если бот ждет номер телефона
  if (orderData[chatId] && orderData[chatId].step === "phone") {
    orderData[chatId].phone = contact.phone_number;
    orderData[chatId].step = "quantity";

    ctx.reply(
      "Введите количество листов или выберите один из вариантов:",
      Markup.keyboard([["20 шт", "50 шт", "100 шт"]])
        .oneTime()
        .resize()
    );
  }
});


// Команда /orders для администратора
bot.command("orders", async (ctx) => {
  if (!(admins.find((i) => {
    return i == ctx.from.id;
  }))) {
    return ctx.reply("🚫 У вас нет доступа к этой команде.");
  }

  const orders = await Order.find().sort({ createdAt: 1 }).limit(10);

  if (!orders.length) {
    return ctx.reply("Пока нет заказов.");
  }

  for (const o of orders) {
    const msg =
      `*Заказ:*\n` +
      `👤 ${escapeMarkdown(o.username || "—")}\n` +
      `📞 ${escapeMarkdown(o.phone)}\n` +
      `📦 ${escapeMarkdown(o.quantity)} листов \\(${escapeMarkdown(
        o.category
      )}\\)\n` +
      `🕒 ${escapeMarkdown(o.createdAt.toLocaleString())}`;

    await ctx.reply(msg, {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("🗑 Удалить", `delete_${o._id}`)],
      ]),
    });
  }
});
// Обработка удаления
bot.action(/delete_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];

  await Order.findByIdAndDelete(orderId);
  await ctx.editMessageText("✅ Заказ удалён\\.", {
    parse_mode: "MarkdownV2",
  });
});




bot.on('text', async (ctx) => {
  const user = orderData[ctx.chat.id];
  if (!user) return;

    if (ctx.message.text === "❌ Отмена") {
      delete orderData[ctx.chat.id];
      return ctx.reply("❌ Заказ отменён.", {
        reply_markup: { remove_keyboard: true },
      });
    }

  if (user.step === "phone") {
    user.phone = ctx.message.text;
    user.step = "quantity";

    ctx.reply(
      "Введите количество листов или выберите один из вариантов:",
      Markup.keyboard([["20 шт", "50 шт", "100 шт"]])
        .oneTime()
        .resize()
    );
  } else if (user.step === "quantity") {
    user.quantity = ctx.message.text;
    user.step = "category";
    ctx.reply(
      "Укажите категорию (например: 16 мм или 18 мм):",
      Markup.keyboard([["16 мм", "18 мм"]])
        .oneTime()
        .resize()
    );
  } else if (user.step === "category") {
    user.category = ctx.message.text;
    ctx.reply(
      `Номер: ${user.phone},\nКол-во: ${user.quantity},\nКатегория: ${user.category}.`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("✅ Потвердить", "confirm")],
          [Markup.button.callback("🗑 Заново", "order")],
        ]),
      }
    );
  }
});
bot.action("confirm", async (ctx) => {
  const user = orderData[ctx.chat.id];
  const newOrder = new Order({
    username: ctx.from.username,
    phone: user.phone,
    quantity: user.quantity,
    category: user.category,
  });
  await newOrder.save();
  ctx.reply("✅ Заказ успешно сохранён! Мы скоро свяжемся с вами.");
  delete orderData[ctx.chat.id];

  // Оповещение администратору
  const adminMessage1 = `
📦 *Новый заказ!*
👤 Пользователь: @${ctx.from.username || "Без никнейма"}
📞 Телефон: ${user.phone}
📦 Количество: ${user.quantity} листов
🏷 Категория: ${user.category || "Не выбрана"}
🕒 ${new Date().toLocaleString("ru-RU")}
  `;
  const adminMessage =
    `📦 *Новый заказ!*\n` +
    `👤 Пользователь: ${escapeMarkdown(
      ctx.from.username || "Без никнейма"
    )}\n` +
    `📞Телефон: ${escapeMarkdown(user.phone)}\n` +
    `📦Количество: ${escapeMarkdown(user.quantity)} листов\n` +
    `🏷 Категория: ${escapeMarkdown(user.category || "Не выбрана")}\n` +
    `🕒 ${escapeMarkdown(new Date().toLocaleString("ru-RU"))}`;
  admins.forEach(async (id) => {
    await safeSend(bot, id, adminMessage, { parse_mode: "Markdown" });
  }
  );
});
async function safeSend(bot, chatId, text, options = {}) {
  try {
    await bot.telegram.sendMessage(chatId, text, options);
  } catch (err) {
    if (err.response?.error_code === 400 || err.response?.error_code === 403) {
      console.warn(`⚠️ Skipping invalid or inaccessible chat: ${chatId}`);
    } else {
      console.error(`❌ Unexpected error for chat ${chatId}:`, err);
    }
  }
}





if (process.env.NODE_ENV === "production") {
  bot.telegram.setWebhook(`${URL}/bot${bot_token}`);
  bot.startWebhook(`/bot${bot_token}`, null, PORT);
  console.log("Started with webhook✅");
} else {
  bot.launch()
  console.log("bot is running✅✅✅");
}

function escapeMarkdown(text = "") {
  return text
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`")
    .replace(/>/g, "\\>")
    .replace(/#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/-/g, "\\-")
    .replace(/=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/!/g, "\\!");
}