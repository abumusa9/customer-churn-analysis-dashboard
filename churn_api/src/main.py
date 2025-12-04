import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from src.models.user import db
from src.routes.user import user_bp
from src.routes.churn import churn_bp
from flask_cors import CORS

ARTIFACTS = {
    "src/churn_prediction_model.joblib":
        "https://github.com/abumusa9/customer-churn-analysis-dashboard/releases/download/model/churn_prediction_model.joblib",
    "src/scaler.joblib":
        "https://github.com/abumusa9/customer-churn-analysis-dashboard/releases/download/model/scaler.joblib"
}

def ensure_artifacts():
    """Download model + scaler automatically if missing."""
    for path, url in ARTIFACTS.items():
        if not os.path.exists(path):
            print(f"Downloading {os.path.basename(path)} ...")
            r = requests.get(url)
            r.raise_for_status()
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "wb") as f:
                f.write(r.content)

# Ensure model + scaler BEFORE loading Flask
ensure_artifacts()


app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(churn_bp, url_prefix='/api/churn')

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
