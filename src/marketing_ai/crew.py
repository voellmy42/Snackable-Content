from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task


# Uncomment the following line to use an example of a custom tool
# from marketing_ai.tools.custom_tool import MyCustomTool

# Check our tools documentations for more information on how to use them
# from crewai_tools import SerperDevTool 

@CrewBase
class MarketingAiCrew():
	"""MarketingAi crew"""

	@agent
	def researcher(self) -> Agent:
		return Agent(
			config=self.agents_config['researcher'],
			llm="gpt-4o-mini",
			verbose=True
		)
	
	@agent
	def blog_writer(self) -> Agent:
		return Agent(
			config=self.agents_config['blog_writer'],
			llm="gpt-4o-mini",
			verbose=True
		)

	@agent
	def social_media_manager(self) -> Agent:
		return Agent(
			config=self.agents_config['social_media_manager'],
			llm="gpt-4o-mini",
			verbose=True
		)

	@task
	def research_task(self) -> Task:
		return Task(
			config=self.tasks_config['research_task'],
			output_file='output/research.md'
		)

	@task
	def write_blog_post(self) -> Task:
		return Task(
			config=self.tasks_config['write_blog_post'],
			output_file='output/blog_post.md'
		)
	
	@task
	def write_twitter_post(self) -> Task:
		return Task(
			config=self.tasks_config['write_twitter_post'],
			output_file='output/twitter_post.md'
		)

	@task
	def write_linkedin_post(self) -> Task:
		return Task(
			config=self.tasks_config['write_linkedin_post'],
			output_file='output/linkedin_post.md'
		)

	@crew
	def crew(self) -> Crew:
		"""Creates the MarketingAi crew"""
		return Crew(
			agents=self.agents, # Automatically created by the @agent decorator
			tasks=self.tasks, # Automatically created by the @task decorator
			process=Process.sequential,
			verbose=True,
			# process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
		)