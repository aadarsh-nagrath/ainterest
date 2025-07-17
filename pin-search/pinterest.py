from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import threading

# Set up Chrome options (optional: run headless)
options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--window-size=1920,1080')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')

# Start the driver (adjust path to chromedriver if needed)
driver = webdriver.Chrome(options=options)

def extract_images_continuously(driver, image_urls_set, search_event, new_search_term):
    from selenium.common.exceptions import StaleElementReferenceException
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        # Check if a new search is requested
        if search_event.is_set():
            return  # Exit to allow new search
        # Extract all image URLs from visible image cards
        images = driver.find_elements(By.CSS_SELECTOR, 'div[data-test-id="pin"] img')
        for img in images:
            try:
                src = img.get_attribute('src')
                if src and src not in image_urls_set:
                    image_urls_set.add(src)
                    print(src)
            except StaleElementReferenceException:
                continue
        # Scroll down
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        # Wait for new content to load
        time.sleep(2)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            time.sleep(2)  # Wait a bit more for new pins
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                continue  # No more new content, but keep checking for new search
        last_height = new_height

def input_thread_func(search_event, new_search_term):
    while True:
        user_search = input("Enter your search term for Pinterest (or just press Enter to keep current): ")
        if user_search.strip():
            new_search_term[0] = user_search.strip()
            search_event.set()

try:
    driver.get("https://in.pinterest.com/")

    # Wait for the email input to be present
    wait = WebDriverWait(driver, 15)
    email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
    email_input.clear()
    email_input.send_keys("dibojaf302@lhory.com")

    # Wait for the password input to be present
    password_input = wait.until(EC.presence_of_element_located((By.ID, "password")))
    password_input.clear()
    password_input.send_keys("dibojaf302@lhory.com")  # <-- Replace with the actual password

    # Wait for the login button and click it
    login_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit' and .//div[text()='Log in']]")))

    # Try to close any overlay/popups if present
    try:
        close_btn = driver.find_element(By.CSS_SELECTOR, 'button[aria-label="Close"]')
        close_btn.click()
        time.sleep(1)
    except Exception:
        pass  # No close button found, continue

    # Scroll login button into view
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", login_button)
    time.sleep(0.5)

    # Try clicking the login button, retry if intercepted
    for _ in range(3):
        try:
            login_button.click()
            break
        except Exception as e:
            if 'ElementClickInterceptedException' in str(type(e)):
                time.sleep(1)
            else:
                raise
    else:
        raise Exception("Login button could not be clicked after several attempts.")

    # Optional: wait a bit to see the result
    time.sleep(5)

    # Initial search
    wait = WebDriverWait(driver, 15)
    search_input = wait.until(EC.presence_of_element_located((By.NAME, "searchBoxInput")))
    search_input.click()
    user_search = input("Enter your search term for Pinterest: ")
    search_input.clear()
    search_input.send_keys(user_search)
    search_input.send_keys(Keys.ENTER)
    time.sleep(5)

    # Start input thread for subsequent searches
    search_event = threading.Event()
    new_search_term = ['']
    input_thread = threading.Thread(target=input_thread_func, args=(search_event, new_search_term), daemon=True)
    input_thread.start()

    while True:
        image_urls_set = set()
        search_event.clear()
        extract_images_continuously(driver, image_urls_set, search_event, new_search_term)
        # If we get here, a new search was requested
        search_input = wait.until(EC.presence_of_element_located((By.NAME, "searchBoxInput")))
        search_input.click()
        search_input.clear()
        search_input.send_keys(new_search_term[0])
        search_input.send_keys(Keys.ENTER)
        time.sleep(5)

finally:
    pass
    # driver.quit()