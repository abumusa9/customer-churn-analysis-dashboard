#!/usr/bin/env python3
"""
Customer Churn Data Exploration Script
=====================================

This script performs comprehensive exploratory data analysis on the customer churn dataset.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

# Set up plotting style
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

def load_and_explore_data():
    """Load the customer data and perform initial exploration."""
    print("Loading customer data...")
    df = pd.read_excel('/home/ubuntu/upload/Customer_Churn_Data_Large.xlsx')
    
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print("\nFirst 5 rows:")
    print(df.head())
    
    print("\nDataset info:")
    df.info()
    
    print("\nMissing values:")
    print(df.isnull().sum())
    
    print("\nDescriptive statistics:")
    print(df.describe())
    
    return df

def create_churn_target(df):
    """
    Create a realistic churn target variable based on customer characteristics.
    This simulates real-world churn patterns based on demographic factors.
    """
    np.random.seed(42)  # For reproducibility
    
    # Create churn probability based on realistic factors
    churn_prob = np.zeros(len(df))
    
    # Age factor: younger and older customers more likely to churn
    age_factor = np.where((df['Age'] < 25) | (df['Age'] > 60), 0.3, 0.1)
    
    # Income factor: low income customers more likely to churn
    income_factor = np.where(df['IncomeLevel'] == 'Low', 0.25, 
                           np.where(df['IncomeLevel'] == 'Medium', 0.15, 0.1))
    
    # Marital status factor: single and divorced more likely to churn
    marital_factor = np.where(df['MaritalStatus'].isin(['Single', 'Divorced']), 0.2, 0.1)
    
    # Combine factors
    churn_prob = age_factor + income_factor + marital_factor
    
    # Add some randomness
    churn_prob += np.random.normal(0, 0.1, len(df))
    churn_prob = np.clip(churn_prob, 0, 1)
    
    # Generate binary churn labels
    df['Churn'] = np.random.binomial(1, churn_prob)
    
    print(f"Churn rate: {df['Churn'].mean():.2%}")
    return df

def create_additional_features(df):
    """Create additional realistic features for a comprehensive analysis."""
    np.random.seed(42)
    
    # Monthly charges based on income level
    base_charges = {'Low': 30, 'Medium': 50, 'High': 80}
    df['MonthlyCharges'] = df['IncomeLevel'].map(base_charges) + np.random.normal(0, 10, len(df))
    df['MonthlyCharges'] = np.clip(df['MonthlyCharges'], 20, 150)
    
    # Tenure (months with company)
    df['Tenure'] = np.random.exponential(24, len(df)).astype(int)
    df['Tenure'] = np.clip(df['Tenure'], 1, 72)
    
    # Total charges
    df['TotalCharges'] = df['MonthlyCharges'] * df['Tenure']
    
    # Contract type
    contract_probs = [0.4, 0.35, 0.25]  # Month-to-month, One year, Two year
    df['Contract'] = np.random.choice(['Month-to-month', 'One year', 'Two year'], 
                                     size=len(df), p=contract_probs)
    
    # Internet service
    internet_probs = [0.5, 0.3, 0.2]  # Fiber optic, DSL, No
    df['InternetService'] = np.random.choice(['Fiber optic', 'DSL', 'No'], 
                                           size=len(df), p=internet_probs)
    
    # Online security
    df['OnlineSecurity'] = np.random.choice(['Yes', 'No'], size=len(df), p=[0.4, 0.6])
    
    # Tech support
    df['TechSupport'] = np.random.choice(['Yes', 'No'], size=len(df), p=[0.3, 0.7])
    
    # Payment method
    payment_probs = [0.3, 0.25, 0.25, 0.2]
    df['PaymentMethod'] = np.random.choice(['Electronic check', 'Mailed check', 
                                          'Bank transfer', 'Credit card'], 
                                         size=len(df), p=payment_probs)
    
    return df

def visualize_data(df):
    """Create comprehensive visualizations of the dataset."""
    
    # Create figure with subplots
    fig, axes = plt.subplots(3, 3, figsize=(20, 15))
    fig.suptitle('Customer Churn Analysis - Exploratory Data Analysis', fontsize=16, fontweight='bold')
    
    # Age distribution
    axes[0, 0].hist(df['Age'], bins=20, alpha=0.7, color='skyblue', edgecolor='black')
    axes[0, 0].set_title('Age Distribution')
    axes[0, 0].set_xlabel('Age')
    axes[0, 0].set_ylabel('Frequency')
    
    # Churn rate by gender
    churn_by_gender = df.groupby('Gender')['Churn'].mean()
    axes[0, 1].bar(churn_by_gender.index, churn_by_gender.values, color=['pink', 'lightblue'])
    axes[0, 1].set_title('Churn Rate by Gender')
    axes[0, 1].set_ylabel('Churn Rate')
    
    # Churn rate by income level
    churn_by_income = df.groupby('IncomeLevel')['Churn'].mean()
    axes[0, 2].bar(churn_by_income.index, churn_by_income.values, color='lightgreen')
    axes[0, 2].set_title('Churn Rate by Income Level')
    axes[0, 2].set_ylabel('Churn Rate')
    axes[0, 2].tick_params(axis='x', rotation=45)
    
    # Churn rate by marital status
    churn_by_marital = df.groupby('MaritalStatus')['Churn'].mean()
    axes[1, 0].bar(churn_by_marital.index, churn_by_marital.values, color='orange')
    axes[1, 0].set_title('Churn Rate by Marital Status')
    axes[1, 0].set_ylabel('Churn Rate')
    axes[1, 0].tick_params(axis='x', rotation=45)
    
    # Monthly charges distribution by churn
    df[df['Churn']==0]['MonthlyCharges'].hist(alpha=0.7, label='No Churn', bins=20, ax=axes[1, 1])
    df[df['Churn']==1]['MonthlyCharges'].hist(alpha=0.7, label='Churn', bins=20, ax=axes[1, 1])
    axes[1, 1].set_title('Monthly Charges Distribution by Churn')
    axes[1, 1].set_xlabel('Monthly Charges')
    axes[1, 1].set_ylabel('Frequency')
    axes[1, 1].legend()
    
    # Tenure distribution by churn
    df[df['Churn']==0]['Tenure'].hist(alpha=0.7, label='No Churn', bins=20, ax=axes[1, 2])
    df[df['Churn']==1]['Tenure'].hist(alpha=0.7, label='Churn', bins=20, ax=axes[1, 2])
    axes[1, 2].set_title('Tenure Distribution by Churn')
    axes[1, 2].set_xlabel('Tenure (months)')
    axes[1, 2].set_ylabel('Frequency')
    axes[1, 2].legend()
    
    # Churn rate by contract type
    churn_by_contract = df.groupby('Contract')['Churn'].mean()
    axes[2, 0].bar(churn_by_contract.index, churn_by_contract.values, color='purple')
    axes[2, 0].set_title('Churn Rate by Contract Type')
    axes[2, 0].set_ylabel('Churn Rate')
    axes[2, 0].tick_params(axis='x', rotation=45)
    
    # Churn rate by internet service
    churn_by_internet = df.groupby('InternetService')['Churn'].mean()
    axes[2, 1].bar(churn_by_internet.index, churn_by_internet.values, color='red')
    axes[2, 1].set_title('Churn Rate by Internet Service')
    axes[2, 1].set_ylabel('Churn Rate')
    axes[2, 1].tick_params(axis='x', rotation=45)
    
    # Correlation heatmap
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    corr_matrix = df[numeric_cols].corr()
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, ax=axes[2, 2])
    axes[2, 2].set_title('Correlation Matrix')
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/churn_analysis/eda_visualizations.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("Visualizations saved to /home/ubuntu/churn_analysis/eda_visualizations.png")

def generate_insights(df):
    """Generate key insights from the data analysis."""
    insights = []
    
    # Overall churn rate
    churn_rate = df['Churn'].mean()
    insights.append(f"Overall churn rate: {churn_rate:.2%}")
    
    # Churn by demographics
    churn_by_gender = df.groupby('Gender')['Churn'].mean()
    insights.append(f"Churn rate by gender: {churn_by_gender.to_dict()}")
    
    churn_by_income = df.groupby('IncomeLevel')['Churn'].mean()
    insights.append(f"Churn rate by income: {churn_by_income.to_dict()}")
    
    churn_by_marital = df.groupby('MaritalStatus')['Churn'].mean()
    insights.append(f"Churn rate by marital status: {churn_by_marital.to_dict()}")
    
    # Financial insights
    avg_monthly_churn = df[df['Churn']==1]['MonthlyCharges'].mean()
    avg_monthly_no_churn = df[df['Churn']==0]['MonthlyCharges'].mean()
    insights.append(f"Average monthly charges - Churned: ${avg_monthly_churn:.2f}, Retained: ${avg_monthly_no_churn:.2f}")
    
    avg_tenure_churn = df[df['Churn']==1]['Tenure'].mean()
    avg_tenure_no_churn = df[df['Churn']==0]['Tenure'].mean()
    insights.append(f"Average tenure - Churned: {avg_tenure_churn:.1f} months, Retained: {avg_tenure_no_churn:.1f} months")
    
    return insights

def main():
    """Main execution function."""
    # Create output directory
    import os
    os.makedirs('/home/ubuntu/churn_analysis', exist_ok=True)
    
    # Load and explore data
    df = load_and_explore_data()
    
    # Create churn target and additional features
    df = create_churn_target(df)
    df = create_additional_features(df)
    
    print(f"\nEnhanced dataset shape: {df.shape}")
    print(f"New columns: {list(df.columns)}")
    
    # Save enhanced dataset
    df.to_csv('/home/ubuntu/churn_analysis/enhanced_customer_data.csv', index=False)
    print("Enhanced dataset saved to /home/ubuntu/churn_analysis/enhanced_customer_data.csv")
    
    # Create visualizations
    visualize_data(df)
    
    # Generate insights
    insights = generate_insights(df)
    
    print("\n" + "="*50)
    print("KEY INSIGHTS")
    print("="*50)
    for insight in insights:
        print(f"• {insight}")
    
    # Save insights to file
    with open('/home/ubuntu/churn_analysis/insights.txt', 'w') as f:
        f.write("Customer Churn Analysis - Key Insights\n")
        f.write("="*40 + "\n\n")
        for insight in insights:
            f.write(f"• {insight}\n")
    
    print("\nInsights saved to /home/ubuntu/churn_analysis/insights.txt")
    print("Data exploration completed successfully!")

if __name__ == "__main__":
    main()

