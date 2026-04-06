import os
import psycopg2
from telegram import Update, constants
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
DATABASE_URL = os.environ.get("DATABASE_URL")


def get_db():
    return psycopg2.connect(DATABASE_URL)


def log_user(user):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bot_users (telegram_id, username, first_name, last_name, language_code, first_seen, last_seen, message_count)
            VALUES (%s, %s, %s, %s, %s, NOW(), NOW(), 1)
            ON CONFLICT (telegram_id) DO UPDATE SET
                username = EXCLUDED.username,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                language_code = EXCLUDED.language_code,
                last_seen = NOW(),
                message_count = bot_users.message_count + 1
        """, (
            user.id,
            user.username,
            user.first_name,
            user.last_name,
            user.language_code,
        ))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"DB error: {e}")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    log_user(user)
    await context.bot.send_chat_action(update.effective_chat.id, constants.ChatAction.TYPING)
    await update.message.reply_text(f"សួស្តី {user.first_name}")


app = ApplicationBuilder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
