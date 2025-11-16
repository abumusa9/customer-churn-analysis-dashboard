from flask import Blueprint, request, jsonify
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os

churn_bp = Blueprint('churn', __name__)

# Load model and scaler
model_path = os.path.join(os.path.dirname(__file__), '..', 'churn_prediction_model.joblib')
scaler_path = os.path.join(os.path.dirname(__file__), '..', 'scaler.joblib')
features_path = os.path.join(os.path.dirname(__file__), '..', 'model_features.txt')
data_path = os.path.join(os.path.dirname(__file__), '..', 'enhanced_customer_data.csv')

model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

# Load feature names
with open(features_path, 'r') as f:
    feature_names = [line.strip() for line in f.readlines()]

# Load data for analytics
df = pd.read_csv(data_path)

@churn_bp.route('/predict', methods=['POST'])
def predict_churn():
    """Predict churn for a single customer."""
    try:
        data = request.json
        
        # Create DataFrame from input
        input_df = pd.DataFrame([data])
        
        # Preprocess the input data
        # Apply label encoding for categorical features
        categorical_mappings = {
            'Gender': {'M': 1, 'F': 0},
            'MaritalStatus': {'Divorced': 0, 'Married': 1, 'Single': 2, 'Widowed': 3},
            'IncomeLevel': {'High': 0, 'Low': 1, 'Medium': 2},
            'Contract': {'Month-to-month': 1, 'One year': 2, 'Two year': 0},
            'InternetService': {'DSL': 0, 'Fiber optic': 1, 'No': 2},
            'OnlineSecurity': {'No': 0, 'Yes': 1},
            'TechSupport': {'No': 0, 'Yes': 1},
            'PaymentMethod': {'Bank transfer': 0, 'Credit card': 1, 'Electronic check': 2, 'Mailed check': 3}
        }
        
        for col, mapping in categorical_mappings.items():
            if col in input_df.columns:
                input_df[col] = input_df[col].map(mapping)
        
        # Ensure all features are present and in correct order
        for feature in feature_names:
            if feature not in input_df.columns:
                input_df[feature] = 0
        
        input_df = input_df[feature_names]
        
        # Scale numerical features
        numerical_cols = ['Age', 'MonthlyCharges', 'Tenure', 'TotalCharges']
        input_df[numerical_cols] = scaler.transform(input_df[numerical_cols])
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0][1]
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': 'High' if probability > 0.7 else 'Medium' if probability > 0.4 else 'Low'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@churn_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data for dashboard."""
    try:
        # Overall statistics
        total_customers = len(df)
        churned_customers = df['Churn'].sum()
        churn_rate = churned_customers / total_customers
        
        # Churn by demographics
        churn_by_gender = df.groupby('Gender')['Churn'].agg(['count', 'sum', 'mean']).to_dict('index')
        churn_by_income = df.groupby('IncomeLevel')['Churn'].agg(['count', 'sum', 'mean']).to_dict('index')
        churn_by_marital = df.groupby('MaritalStatus')['Churn'].agg(['count', 'sum', 'mean']).to_dict('index')
        churn_by_contract = df.groupby('Contract')['Churn'].agg(['count', 'sum', 'mean']).to_dict('index')
        
        # Financial metrics
        avg_monthly_charges_churned = df[df['Churn']==1]['MonthlyCharges'].mean()
        avg_monthly_charges_retained = df[df['Churn']==0]['MonthlyCharges'].mean()
        avg_tenure_churned = df[df['Churn']==1]['Tenure'].mean()
        avg_tenure_retained = df[df['Churn']==0]['Tenure'].mean()
        
        # Age distribution
        age_bins = [18, 25, 35, 45, 55, 65, 100]
        age_labels = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
        df['AgeGroup'] = pd.cut(df['Age'], bins=age_bins, labels=age_labels, right=False)
        churn_by_age = df.groupby('AgeGroup')['Churn'].agg(['count', 'sum', 'mean']).to_dict('index')
        
        return jsonify({
            'overview': {
                'total_customers': int(total_customers),
                'churned_customers': int(churned_customers),
                'churn_rate': float(churn_rate),
                'retention_rate': float(1 - churn_rate)
            },
            'demographics': {
                'gender': churn_by_gender,
                'income': churn_by_income,
                'marital_status': churn_by_marital,
                'age_group': churn_by_age
            },
            'business_metrics': {
                'contract': churn_by_contract,
                'avg_monthly_charges': {
                    'churned': float(avg_monthly_charges_churned),
                    'retained': float(avg_monthly_charges_retained)
                },
                'avg_tenure': {
                    'churned': float(avg_tenure_churned),
                    'retained': float(avg_tenure_retained)
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@churn_bp.route('/customers', methods=['GET'])
def get_customers():
    """Get customer data with pagination."""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        customers_subset = df.iloc[start_idx:end_idx].to_dict('records')
        
        return jsonify({
            'customers': customers_subset,
            'total': len(df),
            'page': page,
            'per_page': per_page,
            'total_pages': (len(df) + per_page - 1) // per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@churn_bp.route('/feature-importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance from the model."""
    try:
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feature_importance = [
                {'feature': feature, 'importance': float(importance)}
                for feature, importance in zip(feature_names, importances)
            ]
            # Sort by importance
            feature_importance.sort(key=lambda x: x['importance'], reverse=True)
            return jsonify({'feature_importance': feature_importance})
        else:
            return jsonify({'error': 'Model does not support feature importance'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

