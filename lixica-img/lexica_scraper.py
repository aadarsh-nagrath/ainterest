import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import psycopg2

options = webdriver.ChromeOptions()
options.add_argument('--start-maximized')
options.add_argument('--headless=new')  # Use new headless mode for Chrome 109+

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
wait = WebDriverWait(driver, 10)

# Hardcoded Postgres connection details for docker-compose
PG_HOST = 'localhost'
PG_PORT = '5432'
PG_DB = 'ainterest'
PG_USER = 'ainterest_user'
PG_PASS = 'ainterest_password'  # No password for local docker-compose

# Connect to Postgres
try:
    conn = psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        dbname=PG_DB,
        user=PG_USER,
        password=PG_PASS
    )
    conn.autocommit = True
    cur = conn.cursor()
except Exception as e:
    print(f"Could not connect to Postgres: {e}")
    conn = None
    cur = None


def scroll_to_bottom():
    last_height = driver.execute_script("return document.body.scrollHeight")
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    new_height = driver.execute_script("return document.body.scrollHeight")
    return new_height != last_height


def get_all_gridcells():
    gridcells = driver.find_elements(By.CSS_SELECTOR, 'div[role="gridcell"]')
    def get_pos(cell):
        style = cell.get_attribute('style')
        top = left = 0
        if style:
            for part in style.split(';'):
                if 'top:' in part:
                    try:
                        top = int(float(part.split('top:')[1].replace('px','').strip()))
                    except Exception:
                        top = 0
                if 'left:' in part:
                    try:
                        left = int(float(part.split('left:')[1].replace('px','').strip()))
                    except Exception:
                        left = 0
        return (top, left)
    return sorted(gridcells, key=get_pos)


def insert_image_to_db(url, description, idx):
    if not cur:
        return
    try:
        # Compose the insert statement, using url as uuid and ON CONFLICT DO NOTHING
        cur.execute(
            '''INSERT INTO "Image" (id, uuid, name, url, description, tags, "userId")
               VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, NULL)
               ON CONFLICT (uuid) DO NOTHING''',
            (url, f'Image {idx}', url, description, ['art', 'ai', 'lexi'])
        )
        print(f"Inserted into DB: {url}")
    except Exception as e:
        print(f"DB insert error: {e}")


def extract_image_and_desc_from_gridcell(gridcell, idx):
    try:
        img = gridcell.find_element(By.TAG_NAME, 'img')
        img_url = img.get_attribute('src')
        prompt_link = gridcell.find_element(By.CSS_SELECTOR, 'a[href^="/prompt/"]')
        prompt_href = prompt_link.get_attribute('href')
        # Open prompt in new tab
        driver.execute_script(f"window.open('{prompt_href}', '_blank');")
        time.sleep(0.5)
        if len(driver.window_handles) < 2:
            return img_url, None
        driver.switch_to.window(driver.window_handles[1])
        try:
            desc_p = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'p'))
            )
            description = desc_p.text
        except Exception:
            description = None
        driver.close()
        driver.switch_to.window(driver.window_handles[0])
        return img_url, description
    except Exception as e:
        print(f"Error extracting: {e}")
        # Clean up any stray windows
        while len(driver.window_handles) > 1:
            driver.switch_to.window(driver.window_handles[-1])
            driver.close()
        driver.switch_to.window(driver.window_handles[0])
        return None, None


def main():
    driver.get('https://lexica.art/')
    time.sleep(3)
    seen = set()
    idx = 1
    while True:
        gridcells = get_all_gridcells()
        new_found = False
        for gridcell in gridcells:
            try:
                img = gridcell.find_element(By.TAG_NAME, 'img')
                img_url = img.get_attribute('src')
                if img_url in seen or not img_url:
                    continue
                seen.add(img_url)
                url, desc = extract_image_and_desc_from_gridcell(gridcell, idx)
                if url and desc:
                    insert_image_to_db(url, desc, idx)
                    print(f"Found: {url} | {desc}")
                    idx += 1
                new_found = True
            except Exception as e:
                print(f"Skipping gridcell: {e}")
        if not scroll_to_bottom() and not new_found:
            break
    print(f"Done. Extracted {idx-1} images.")
    driver.quit()
    if cur:
        cur.close()
    if conn:
        conn.close()

if __name__ == '__main__':
    main() 