from flask import Blueprint

api_bp = Blueprint("api", __name__)

from app.api import health     # noqa: E402, F401
from app.api import auth       # noqa: E402, F401
from app.api import catalog    # noqa: E402, F401
from app.api import stores     # noqa: E402, F401
from app.api import products   # noqa: E402, F401
from app.api import orders     # noqa: E402, F401
from app.api import campaigns  # noqa: E402, F401
from app.api import billing    # noqa: E402, F401
from app.api import integrations # noqa: E402, F401
