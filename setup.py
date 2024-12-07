from setuptools import setup, find_packages

setup(
    name="vcegen",
    version="0.1.0",
    description="Python library for generating VCE-ready files from PDFs",
    url="https://github.com/starkfire/vcegen",
    packages=find_packages(exclude=('docs', 'tests'))
)
