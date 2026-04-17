from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# ========================

# SECURITY

# ========================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-2c*on$=x0e-js6jvp!&hpkke#prfp2!s(f3mg&seo=$zb0zhb%"
)

DEBUG = os.getenv("DEBUG", "True").strip().lower() == "true"

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "127.0.0.1,localhost,shubhamfruits.com,[www.shubhamfruits.com](http://www.shubhamfruits.com)"
).split(",")

# ========================

# APPLICATIONS

# ========================

INSTALLED_APPS = [
    "corsheaders",
    "rest_framework",
    "transactions",
    "accounts",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# ========================

# MIDDLEWARE

# ========================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

# ========================

# TEMPLATES

# ========================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ========================

# DATABASE CONFIG

# ========================

USE_SQLITE = os.getenv("USE_SQLITE", "True").strip().lower() == "true"

if USE_SQLITE:
    # LOCAL (SQLite)
    DATABASES = {
        "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    # VPS (PostgreSQL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER"),
            "PASSWORD": os.getenv("DB_PASSWORD"),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": "5432",
        }
    }

# ========================

# PASSWORD VALIDATION

# ========================

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ========================

# INTERNATIONALIZATION

# ========================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"

USE_I18N = True
USE_TZ = True

# ========================

# STATIC FILES

# ========================

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# ========================

# CORS SETTINGS

# ========================

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
"http://localhost:5173",
]

CORS_ALLOW_HEADERS = [
"content-type",
"authorization",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}