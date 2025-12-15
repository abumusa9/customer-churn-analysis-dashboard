#!/usr/bin/env python3
"""
Customer Churn Prediction Model Development Script
=================================================

This script develops and evaluates machine learning models for customer churn prediction.
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, classification_report
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import warnings
warnings.filterwarnings("ignore")

def load_data(filepath):
    """Loads the enhanced customer data."""
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    print(f"Data loaded. Shape: {df.shape}")
    return df

def preprocess_data(df):
    """Preprocesses the data for model training."""
    print("Preprocessing data...")
    # Drop CustomerID as it's just an identifier
    df = df.drop("CustomerID", axis=1)
    
    # Separate target variable
    X = df.drop("Churn", axis=1)
    y = df["Churn"]
    
    # Identify categorical and numerical columns
    categorical_cols = X.select_dtypes(include=["object"]).columns
    numerical_cols = X.select_dtypes(include=[np.number]).columns
    
    # Apply Label Encoding to categorical features
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        print(f"Label encoded column: {col}")
        
    # Scale numerical features
    scaler = StandardScaler()
    X[numerical_cols] = scaler.fit_transform(X[numerical_cols])
    print("Numerical features scaled.")
    
    return X, y, scaler, categorical_cols, numerical_cols

def train_and_evaluate_model(X_train, X_test, y_train, y_test, model, model_name):
    """Trains and evaluates a given model."""
    print(f"\nTraining {model_name}...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    print(f"--- {model_name} Evaluation ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall: {recall_score(y_test, y_pred):.4f}")
    print(f"F1-Score: {f1_score(y_test, y_pred):.4f}")
    print(f"ROC AUC: {roc_auc_score(y_test, y_proba):.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return model, y_pred, y_proba

def plot_feature_importance(model, feature_names, model_name, save_path):
    """Plots feature importance for tree-based models."""
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        plt.figure(figsize=(12, 6))
        plt.title(f"Feature Importances ({model_name})")
        plt.bar(range(len(importances)), importances[indices], align="center")
        plt.xticks(range(len(importances)), [feature_names[i] for i in indices], rotation=90)
        plt.xlabel("Feature")
        plt.ylabel("Importance")
        plt.tight_layout()
        plt.savefig(save_path)
        plt.close()
        print(f"Feature importance plot saved to {save_path}")

def main():
    """Main execution function."""
    data_filepath = ".//enhanced_customer_data.csv"
    
    # Load data
    df = load_data(data_filepath)
    
    # Preprocess data
    X, y, scaler, categorical_cols, numerical_cols = preprocess_data(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"\nData split into training ({len(X_train)} samples) and testing ({len(X_test)} samples).")
    
    # Initialize models
    models = {
        "Logistic Regression": LogisticRegression(random_state=42),
        "Random Forest": RandomForestClassifier(random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42)
    }
    
    best_model = None
    best_roc_auc = -1
    
    # Train and evaluate models
    for name, model in models.items():
        trained_model, y_pred, y_proba = train_and_evaluate_model(X_train, X_test, y_train, y_test, model, name)
        roc_auc = roc_auc_score(y_test, y_proba)
        
        if roc_auc > best_roc_auc:
            best_roc_auc = roc_auc
            best_model = trained_model
            
        # Plot feature importance if applicable
        plot_feature_importance(trained_model, X.columns, name, f"./{name.replace(' ', '_')}_feature_importance.png")
            
    print(f"\nBest model: {type(best_model).__name__} with ROC AUC: {best_roc_auc:.4f}")
    
    # Save the best model and scaler
    joblib.dump(best_model, "./churn_prediction_model.joblib")
    joblib.dump(scaler, "./scaler.joblib")
    
    # Save the list of columns used for training
    with open("./model_features.txt", "w") as f:
        for col in X.columns:
            f.write(f"{col}\n")
            
    print("Best model, scaler, and feature list saved.")
    print("Model development completed successfully!")

if __name__ == "__main__":
    main()

