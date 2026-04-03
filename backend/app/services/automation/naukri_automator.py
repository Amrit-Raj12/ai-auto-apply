import time
import random
import os
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from dotenv import load_dotenv

load_dotenv()

class NaukriAutomator:
    def __init__(self, headless=False):
        self.headless = headless
        self.browser_context = None
        self.page = None
        self.playwright = None
        self.base_url = "https://www.naukri.com"
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"

    def start(self):
        print("Starting Playwright with Advanced Stealth & Persistence...")
        self.playwright = sync_playwright().start()
        
        user_data_dir = os.getenv("BRAVE_USER_DATA_DIR")
        brave_path = os.getenv("BRAVE_PATH")
        
        launch_args = {
            "headless": self.headless,
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--profile-directory=Default",
                "--no-first-run",
                "--no-default-browser-check"
            ]
        }
        
        if brave_path and os.path.exists(brave_path):
            print(f"Using Brave browser from: {brave_path}")
            launch_args["executable_path"] = brave_path
            
        if user_data_dir and os.path.exists(user_data_dir):
            print(f"Using Persistent Browser Context: {user_data_dir}")
            try:
                self.browser_context = self.playwright.chromium.launch_persistent_context(
                    user_data_dir,
                    **launch_args,
                    user_agent=self.user_agent,
                    viewport={'width': 1280, 'height': 800}
                )
            except Exception as e:
                if "TargetClosedError" in str(e) or "exitCode=21" in str(e):
                    print("\n\n" + "!"*50)
                    print("CRITICAL ERROR: Playwright cannot launch because Brave is ALREADY OPEN.")
                    print("Please CLOSE all Brave browser windows and try again.")
                    print("!"*50 + "\n\n")
                raise e
        else:
            print("Warning: Persistent context path not found. Falling back to standard mode.")
            browser = self.playwright.chromium.launch(**launch_args)
            self.browser_context = browser.new_context(
                user_agent=self.user_agent,
                viewport={'width': 1280, 'height': 800}
            )

        self.page = self.browser_context.new_page()
        
        # Apply Stealth to the page
        Stealth().apply_stealth_sync(self.page)
        print("Stealth signals applied.")

    def login(self, email, password):
        """
        Attempts login, but first checks if already logged in (persistence check).
        """
        print("Checking session status...")
        self.page.goto(self.base_url)
        time.sleep(3)
        
        # Check if already logged in by looking for personalized elements (like 'My Naukri')
        if self.page.query_selector(".nI-g_my-naukri"):
            print("Already logged in via persistent session.")
            return True
            
        print(f"No existing session. Attempting manual login for {email}...")
        self.page.goto(f"{self.base_url}/nlogin/login")
        
        try:
            self.page.fill("#usernameField", email)
            self.page.fill("#passwordField", password)
            time.sleep(random.uniform(1, 3))
            self.page.click("button[type='submit']")
            
            self.page.wait_for_selector(".nI-g_my-naukri", timeout=10000)
            print("Login successful.")
            return True
        except Exception as e:
            print(f"Login failed: {e}")
            return False

    def search_jobs(self, keywords, location=""):
        print(f"Searching for {keywords} in {location}...")
        search_url = f"{self.base_url}/jobs-in-{location.replace(' ', '-')}" if location else f"{self.base_url}/jobs-in-india"
        if keywords:
            search_url += f"?k={keywords.replace(' ', '%20')}"
            
        self.page.goto(search_url)
        print(f"Navigated to: {search_url}")
        
        try:
            self.page.wait_for_selector(".srp-jobtuple-wrapper, .cust-job-tuple, .jobTuple", timeout=15000)
            time.sleep(2)
        except Exception:
            print("Timeout waiting for job listings.")
            return []

        jobs = []
        job_cards = self.page.query_selector_all(".srp-jobtuple-wrapper") or \
                    self.page.query_selector_all(".cust-job-tuple") or \
                    self.page.query_selector_all(".jobTuple")
        
        print(f"Found {len(job_cards)} job cards.")
        
        for card in job_cards[:20]: 
            title_elem = card.query_selector(".title") or card.query_selector("a.title")
            company_elem = card.query_selector(".comp-name") or card.query_selector(".companyName")
            link_elem = card.query_selector("a.title") or card.query_selector(".title")
            location_elem = card.query_selector(".locWraper") or card.query_selector(".loc-wrap")
            
            if title_elem and company_elem and link_elem:
                title = title_elem.inner_text()
                company = company_elem.inner_text()
                link = link_elem.get_attribute("href")
                location = location_elem.inner_text() if location_elem else "Remote/India"
                
                if link and not link.startswith("http"):
                    link = self.base_url + link
                
                jobs.append({
                    "title": title,
                    "company": company,
                    "url": link,
                    "location": location,
                    "platform_job_id": link.split("-")[-1].split("?")[0] if link else str(random.random())
                })
        
        print(f"Scraped {len(jobs)} jobs.")
        return jobs

    def apply_to_job(self, job_url, auto_fill_data):
        print(f"Applying to: {job_url}")
        self.page.goto(job_url)
        time.sleep(random.uniform(2, 4))
        
        apply_btn = self.page.query_selector("button:has-text('Apply')")
        if not apply_btn:
             print("Apply button not found.")
             return False

        apply_btn.click()
        time.sleep(3)

        try:
            # Handle Experience
            if "experience" in auto_fill_data:
                exp_input = self.page.query_selector("input[placeholder*='Experience']")
                if exp_input:
                    exp_input.fill(str(auto_fill_data["experience"]))

            # Handle CTC
            if "current_ctc" in auto_fill_data:
                ctc_input = self.page.query_selector("input[placeholder*='CTC']")
                if ctc_input:
                    ctc_input.fill(str(auto_fill_data["current_ctc"]))

            # Handle Notice Period
            if "notice_period" in auto_fill_data:
                self.page.click(f"text='{auto_fill_data['notice_period']}'", timeout=2000)

            submit_form = self.page.query_selector("button[id*='submit'], button:has-text('Submit')")
            if submit_form:
                submit_form.click()
                time.sleep(2)
        except Exception as e:
            print(f"Form-filling obstacle: {e}")

        return True

    def stop(self):
        # In persistent mode, we close the context first
        if self.browser_context:
            self.browser_context.close()
        if self.playwright:
            self.playwright.stop()
