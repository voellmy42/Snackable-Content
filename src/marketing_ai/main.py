#!/usr/bin/env python
import sys
from marketing_ai.crew import MarketingAiCrew

# This main file is intended to be a way for your to run your
# crew locally, so refrain from adding necessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information

def run():
    """
    Run the crew.
    """
    print("WELCOME TO THE MARKETING AI CREW - ENTER A TOPIC AND WE WILL PRODUCE A WELL RESEARCHED LINKEDIN AND X POST FOR YOU!")
    
    user_input = input("Enter a topic:\n")
    description = input("Enter your thoughts on the topic:\n")
    target_audience = input("What is the target audience for this post?:\n")
    language = input("What language do you want the post to be in?:\n")


    inputs = {
        'topic': user_input,
        'description': description,
        'target_audience': target_audience,
        'language': language,
        'research': 'output/research.md',
    }
    MarketingAiCrew().crew().kickoff(inputs=inputs)


def train():
    """
    Train the crew.
    """
    print("WELCOME TO THE MARKETING AI CREW - TRAINING THE CREW")
    
    user_input = "ANYmal - The Autonomous Industrial Inspection Robot"
    description = "Highlight the benefits of ANYmal for industrial inspection like it' AI-driven mobility, I67 ruggedness"
    target_audience = "Industrial Inspectors Managers"
    language = "english"


    inputs = {
        'topic': user_input,
        'description': description,
        'target_audience': target_audience,
        'language': language,
        'research': 'output/research.md'
    }
    try:
        MarketingAiCrew().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        MarketingAiCrew().crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")

def test():
    """
    Test the crew execution and returns the results.
    """
    inputs = {
        "topic": "AI LLMs"
    }
    try:
        MarketingAiCrew().crew().test(n_iterations=int(sys.argv[1]), openai_model_name=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")