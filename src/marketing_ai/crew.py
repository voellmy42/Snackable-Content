from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
import logging

logger = logging.getLogger(__name__)

@CrewBase
class MarketingAiCrew():
    """MarketingAi crew"""

    def __init__(self):
        logger.info('Initializing MarketingAiCrew')
        super().__init__()
        logger.info('MarketingAiCrew initialized')

    @agent
    def researcher(self) -> Agent:
        logger.info('Creating researcher agent')
        agent = Agent(
            config=self.agents_config['researcher'],
            llm="gpt-4o-mini",
            verbose=True
        )
        logger.info(f'Researcher agent created with goal: {agent.goal}')
        return agent
    
    @agent
    def blog_writer(self) -> Agent:
        logger.info('Creating blog writer agent')
        agent = Agent(
            config=self.agents_config['blog_writer'],
            llm="gpt-4o-mini",
            verbose=True
        )
        logger.info(f'Blog writer agent created with goal: {agent.goal}')
        return agent

    @agent
    def social_media_manager(self) -> Agent:
        logger.info('Creating social media manager agent')
        agent = Agent(
            config=self.agents_config['social_media_manager'],
            llm="gpt-4o-mini",
            verbose=True
        )
        logger.info(f'Social media manager agent created with goal: {agent.goal}')
        return agent

    @task
    def research_task(self) -> Task:
        logger.info('Creating research task')
        task = Task(
            config=self.tasks_config['research_task'],
            output_file='output/research.md'
        )
        logger.info(f'Research task created with description: {task.description}')
        return task

    @task
    def write_blog_post(self) -> Task:
        logger.info('Creating blog post task')
        task = Task(
            config=self.tasks_config['write_blog_post'],
            output_file='output/blog_post.md'
        )
        logger.info(f'Blog post task created with description: {task.description}')
        return task
    
    @task
    def write_twitter_post(self) -> Task:
        logger.info('Creating Twitter post task')
        task = Task(
            config=self.tasks_config['write_twitter_post'],
            output_file='output/twitter_post.md'
        )
        logger.info(f'Twitter post task created with description: {task.description}')
        return task

    @task
    def write_linkedin_post(self) -> Task:
        logger.info('Creating LinkedIn post task')
        task = Task(
            config=self.tasks_config['write_linkedin_post'],
            output_file='output/linkedin_post.md'
        )
        logger.info(f'LinkedIn post task created with description: {task.description}')
        return task

    @crew
    def crew(self) -> Crew:
        """Creates the MarketingAi crew"""
        logger.info('Creating MarketingAi crew')
        crew = Crew(
            agents=[self.researcher(), self.blog_writer(), self.social_media_manager()],
            tasks=[self.research_task(), self.write_blog_post(), self.write_twitter_post(), self.write_linkedin_post()],
            process=Process.sequential,
            verbose=True,
        )
        logger.info('MarketingAi crew created successfully')
        return crew