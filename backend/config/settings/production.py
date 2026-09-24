import os
from .base import *

DEBUG = False
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
