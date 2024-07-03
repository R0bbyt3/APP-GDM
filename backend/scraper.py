from selenium import webdriver

def scrape():
    driver = webdriver.Chrome()  # or Firefox()
    driver.get('https://example.com')
    # Adicione seu código de scraping aqui
    driver.quit()
