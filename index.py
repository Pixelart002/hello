import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Set up logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)
logger = logging.getLogger(__name__)

# Define your bot token
TOKEN = os.getenv("BOT_TOKEN")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    await update.message.reply_text('Hello! I am your bot.')

def main() -> None:
    """Start the bot."""
    application = Application.builder().token(TOKEN).build()

    # Add command handler
    application.add_handler(CommandHandler("start", start))

    # Set webhook
    webhook_url = os.getenv("WEBHOOK_URL")
    application.bot.set_webhook(url=webhook_url)

    # Run the bot
    application.run_webhook(listen="0.0.0.0", port=int(os.getenv("PORT", 5000)),
                            url_path=TOKEN, webhook_url=webhook_url + "/" + TOKEN)

if __name__ == '__main__':
    main()
