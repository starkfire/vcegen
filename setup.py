from setuptools import setup, find_packages


def get_requirements():
    with open("requirements.txt") as file:
        return [line.strip() for line in file if line.strip() and not line.startswith("#")]

requirements = get_requirements()

setup(
    name="vcegen",
    version="0.1.0",
    description="Python library for generating VCE-ready files from PDFs",
    url="https://github.com/starkfire/vcegen",
    packages=find_packages(exclude=['demo', 'docs', 'tests']),
    install_requires=requirements
)
