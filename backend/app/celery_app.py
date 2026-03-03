import os
from celery import Celery
from config import config_map

def make_celery():
    config_name = os.environ.get("FLASK_ENV", "development")
    conf = config_map[config_name]
    
    # We use a static name here to avoid importing create_app
    celery_instance = Celery("app")
    
    # Extract config values manually to avoid Flask app dependency
    celery_instance.conf.update(
        broker_url=conf.CELERY_BROKER_URL,
        result_backend=conf.CELERY_RESULT_BACKEND,
        # Import any other necessary celery configs from your Config class here
    )
    
    return celery_instance

celery = make_celery()

class ContextTask(celery.Task):
    """Ensure each Celery task runs inside a Flask app context."""
    _flask_app = None

    def __call__(self, *args, **kwargs):
        if ContextTask._flask_app is None:
            from app import create_app
            ContextTask._flask_app = create_app()
        
        with ContextTask._flask_app.app_context():
            return self.run(*args, **kwargs)

celery.Task = ContextTask
