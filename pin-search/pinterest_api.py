from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import threading
import os

app = FastAPI()

class SearchRequest(BaseModel):
    search_term: str
    email: str = "dibojaf302@lhory.com"
    password: str = "dibojaf302@lhory.com"  # For demo, you may want to pass this in request or env

# Helper function to yield image URLs as they are found
def pinterest_image_stream(search_term, email, password):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    driver = webdriver.Chrome(options=options)
    try:
        driver.get("https://in.pinterest.com/")
        wait = WebDriverWait(driver, 20)
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.clear()
        email_input.send_keys(email)
        password_input = wait.until(EC.presence_of_element_located((By.ID, "password")))
        password_input.clear()
        password_input.send_keys(password)
        login_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit' and .//div[text()='Log in']]")))
        # Try to close overlays
        try:
            close_btn = driver.find_element(By.CSS_SELECTOR, 'button[aria-label="Close"]')
            close_btn.click()
            time.sleep(0.5)
        except Exception:
            pass
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", login_button)
        time.sleep(0.3)
        for _ in range(3):
            try:
                login_button.click()
                break
            except Exception as e:
                if 'ElementClickInterceptedException' in str(type(e)):
                    time.sleep(0.5)
                else:
                    raise
        else:
            raise Exception("Login button could not be clicked after several attempts.")
        # Wait for search box
        search_input = wait.until(EC.presence_of_element_located((By.NAME, "searchBoxInput")))
        search_input.click()
        search_input.clear()
        search_input.send_keys(search_term)
        search_input.send_keys(Keys.ENTER)
        # Wait for first image to appear after search
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[data-test-id="pin"] img')))
        image_urls_set = set()
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            images = driver.find_elements(By.CSS_SELECTOR, 'div[data-test-id="pin"] img')
            for img in images:
                src = img.get_attribute('src')
                if src and src not in image_urls_set:
                    image_urls_set.add(src)
                    yield src + "\n"
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(0.7)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                time.sleep(0.7)
                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break
            last_height = new_height
    finally:
        driver.quit()

@app.post("/search")
def search_images(req: SearchRequest):
    return StreamingResponse(
        pinterest_image_stream(req.search_term, req.email, req.password),
        media_type="text/plain"
    ) 