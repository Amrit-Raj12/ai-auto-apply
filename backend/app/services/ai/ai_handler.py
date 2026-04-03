import json
import os
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv

# Load local environment variables if they exist
load_dotenv(find_dotenv(".env.local"))
load_dotenv()

class AIHandler:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.mode = os.getenv("AI_MODE", "openai").lower()
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "gpt-4o-mini"

    def parse_intent(self, command: str):
        if self.mode == "mock" or not self.client:
            import re

            # Default values
            limit = 5
            keyword = "Software Engineer"
            experience = ""
            location = ""

            # Try to extract numbers (like '2', 'two', etc.)
            number_map = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10}
            
            # Find number for limit (e.g., 'two jobs', '2 react')
            limit_match = re.search(r'\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b(?=\s*(?:jobs?|react|developer|position))', command, re.IGNORECASE)
            if limit_match:
                val = limit_match.group(1).lower()
                limit = int(val) if val.isdigit() else number_map.get(val, 5)

            # Cap limit
            limit = min(limit, 50)

            # Extract Experience (e.g., 'experience 3 years', '3 years of experience', '3 yrs')
            exp_match = re.search(r'(\d+)\s*(?:years?|yrs?)(?:\s*of)?\s*exp(?:erience)?|exp(?:erience)?\s*(?:of\s*)?(\d+)', command, re.IGNORECASE)
            if exp_match:
                experience = exp_match.group(1) or exp_match.group(2)

            # Extract location (e.g. 'location Kolkatal', 'in Bangalore')
            loc_match = re.search(r'(?:location|in)\s+([a-zA-Z]+)', command, re.IGNORECASE)
            if loc_match:
                location = loc_match.group(1)

            # Extract Keyword (what's left before experience/location or clearly defined)
            # Find everything between "jobs" and "experience" or "location" if possible
            # Or just strip out noise words
            filler = re.compile(
                r'\b(apply|to|latest|jobs?|openings?|positions?|listings?|for|me|please|now|and|find|search|get|of|experince|experience|yrs?|years?|location|in|locate|located|at)\b|\b\d+\b',
                re.IGNORECASE
            )
            raw_keyword = command
            if location:
                raw_keyword = re.sub(rf'(?i)\b(?:location|in)\s+{location}\b', '', raw_keyword)
            if experience:
                raw_keyword = re.sub(rf'(?i)(\d+)\s*(?:years?|yrs?).*exp(?:erience)?|exp(?:erience)?\s*(?:of\s*)?(\d+)', '', raw_keyword)
            # Remove limit number words
            for num_word in list(number_map.keys()) + [str(limit)]:
                raw_keyword = re.sub(rf'(?i)\b{num_word}\b', '', raw_keyword)

            keyword_text = filler.sub('', raw_keyword).strip()
            
            # Remove extra spaces and slashes
            keyword_text = re.sub(r'[\/\\]', ' ', keyword_text)
            keyword_text = re.sub(r'\s+', ' ', keyword_text).strip()

            keyword = keyword_text if keyword_text else "Software Engineer"

            print(f"[MOCK PARSER] Command: '{command}' -> limit={limit}, keyword='{keyword}', experience='{experience}', location='{location}'")
            return {
                "intent": "APPLY_JOBS",
                "entities": {"limit": limit, "keyword": keyword, "experience": experience, "location": location}
            }

        
        system_prompt = """
        You are an AI assistant for a job automation platform.
        Extract the following intent and entities from the user's command:
        - intent: (e.g., 'APPLY_JOBS', 'SEARCH_JOBS', 'GET_STATS', 'UPDATE_PROFILE')
        - entities: Extract these specific fields if present:
            - limit: (number of jobs, e.g. 10. Default to 5)
            - keyword: (job title/role, e.g. 'React Developer'. ONLY the core job title. Do NOT include filler words like 'apply', 'jobs', 'locate', or the full sentence.)
            - location: (e.g. 'Kolkata', 'Bangalore'. Default to '')
            - experience: (e.g. '3', '5'. Just the number as string. Default to '')
        
        Return ONLY a JSON object.
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": command}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

    def score_job(self, job_description: str, resume_text: str):
        if self.mode == "mock" or not self.client:
            return {"score": 85, "reason": "MOCK: Strong match found in simulated mode."}
            
        system_prompt = """
        You are a hiring manager. Compare the job description and the resume.
        Provide a match score (0-100) and a brief reason.
        Return ONLY a JSON object like: {"score": 85, "reason": "Good match for React skills but lacks Go experience."}
        """
        
        prompt = f"Job Description:\n{job_description}\n\nResume:\n{resume_text}"
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

    def extract_form_details(self, job_fields: list, user_profile: dict):
        if self.mode == "mock" or not self.client:
            return {field: "Mock Value" for field in job_fields}
            
        system_prompt = """
        Based on the user profile, provide values for the requested job application fields.
        Return ONLY a JSON mapping.
        """
        
        prompt = f"Requested Fields: {job_fields}\n\nUser Profile: {user_profile}"
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

# Quick test helper
if __name__ == "__main__":
    ai = AIHandler()
    # print(ai.parse_intent("Apply to latest 10 React jobs"))
