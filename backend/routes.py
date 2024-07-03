from flask import Blueprint
from scraper import scrape

scraper_bp = Blueprint('scraper', __name__)

@scraper_bp.route('/scrape')
def run_scrape():
    scrape()
    return "Scraping done!"

from app import app
app.register_blueprint(scraper_bp)
