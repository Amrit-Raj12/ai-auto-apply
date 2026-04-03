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
            return {
                "intent": "APPLY_JOBS",
                "entities": {"limit": 10, "keyword": "React", "location": "India"}
            }
        
        system_prompt = """
        You are an AI assistant for a job automation platform.
        Extract the following intent and entities from the user's command:
        - intent: (e.g., 'APPLY_JOBS', 'SEARCH_JOBS', 'GET_STATS', 'UPDATE_PROFILE')
        - entities: (e.g., {'limit': 10, 'keyword': 'React', 'location': 'Bangalore'})
        
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
