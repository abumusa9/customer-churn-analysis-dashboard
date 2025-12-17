## Customer Churn Analysis System

### Project Demo Video

Click the link to watch the full demo -->
[Customer Churn Analysis System](https://abumusalab.com.ng/customer-churn-analysis-dashboard/)


### Overview

I use Lloyds Banking Group Dataset through Forage Job simulation. This project presents a comprehensive customer churn analysis system that demonstrates advanced AI engineering capabilities through the integration of machine learning, backend API development, and interactive frontend visualization. The system is designed to predict customer churn probability and provide actionable insights for business decision-making.  

## Features

### Data Analysis & Visualization
- Comprehensive exploratory data analysis with statistical insights
- Interactive charts and visualizations using Recharts
- Real-time analytics dashboard with key performance indicators

### Machine Learning Models
- Multiple ML algorithms: Logistic Regression, Random Forest, Gradient Boosting
- Model comparison and selection based on ROC AUC performance
- Feature importance analysis for interpretability

### Backend API
- RESTful API built with Flask
- CORS-enabled for seamless frontend integration
- Endpoints for prediction, analytics, and customer data

### Interactive Frontend
- Modern React application with responsive design
- Real-time churn prediction interface
- Advanced analytics dashboard with multiple visualizations
- Customer database browser with pagination

### Key Metrics
- Overall churn rate: 47.2%
- Model accuracy: 85.4% (Gradient Boosting)
- ROC AUC Score: 0.854
- 1,000 customer records analyzed

## Technology Stack

### Backend
- **Python 3.11**: Core programming language
- **Flask**: Web framework for API development
- **scikit-learn**: Machine learning library
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **joblib**: Model serialization

### Frontend
- **React 18**: Frontend framework
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **Recharts**: Data visualization library
- **Lucide React**: Icon library

### Data Processing
- **matplotlib**: Static plotting
- **seaborn**: Statistical data visualization
- **openpyxl**: Excel file processing

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to the backend directory:
```bash
cd churn_api
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Flask server:
```bash
python src/main.py
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd churn-dashboard
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server```bash
pnpm run dev
```

The frontend will be available at `http://localhost:5173`

### Production Build

1. Build the React application:
```bash
cd churn-dashboard
pnpm run build
```

2. Copy build files to Flask static directory:
```bash
cp -r dist/* ../churn_api/src/static/
```

3. Access the full-stack application at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api/churn
```

### Endpoints

#### POST /predict
Predict churn probability for a single customer.

**Request Body:**
```json
{
  "Age": 35,
  "Gender": "M",
  "MaritalStatus": "Married",
  "IncomeLevel": "Medium",
  "MonthlyCharges": 65.50,
  "Tenure": 24,
  "TotalCharges": 1572.00,
  "Contract": "One year",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "Yes",
  "TechSupport": "No",
  "PaymentMethod": "Credit card"
}
```

**Response:**
```json
{
  "prediction": 0,
  "probability": 0.23,
  "risk_level": "Low"
}
```

#### GET /analytics
Retrieve comprehensive analytics data.

**Response:**
```json
{
  "overview": {
    "total_customers": 1000,
    "churned_customers": 472,
    "churn_rate": 0.472,
    "retention_rate": 0.528
  },
  "demographics": {
    "gender": {...},
    "income": {...},
    "marital_status": {...},
    "age_group": {...}
  },
  "business_metrics": {
    "contract": {...},
    "avg_monthly_charges": {...},
    "avg_tenure": {...}
  }
}
```

#### GET /customers
Retrieve paginated customer data.

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)

#### GET /feature-importance
Get feature importance from the trained model.

## Machine Learning Pipeline

### Data Preprocessing
1. **Feature Engineering**: Created realistic additional features including monthly charges, tenure, contract type, and service details
2. **Label Encoding**: Categorical variables encoded using scikit-learn's LabelEncoder
3. **Feature Scaling**: Numerical features standardized using StandardScaler
4. **Train-Test Split**: 80/20 split with stratification to maintain class balance

### Model Training & Evaluation
Three machine learning algorithms were trained and compared:

| Model | Accuracy | Precision | Recall | F1-Score | ROC AUC |
|-------|----------|-----------|--------|----------|---------|
| Logistic Regression | 52.5% | 49.3% | 39.4% | 43.8% | 53.8% |
| Random Forest | 79.0% | 78.9% | 75.5% | 77.2% | 83.1% |
| **Gradient Boosting** | **77.0%** | **75.0%** | **76.6%** | **75.8%** | **85.4%** |

The Gradient Boosting Classifier was selected as the best model based on the highest ROC AUC score of 0.854.

### Feature Importance
The most influential factors for churn prediction:
1. **Tenure**: Customer relationship duration
2. **Age**: Customer age demographics
3. **Monthly Charges**: Service pricing impact
4. **Total Charges**: Cumulative spending
5. **Income Level**: Economic factors

## Key Insights

### Customer Demographics
- **Gender Distribution**: Fairly balanced with 51.3% female and 48.7% male customers
- **Age Impact**: Customers aged 18-24 and 65+ show higher churn rates
- **Marital Status**: Single and divorced customers have higher churn propensity

### Financial Patterns
- **Churned customers** average $52.37 in monthly charges
- **Retained customers** average $56.28 in monthly charges
- **Tenure difference**: Churned customers average 24.7 months vs 20.4 months for retained

### Service Preferences
- **Contract Type**: Month-to-month contracts show highest churn rates (49.1%)
- **Internet Service**: Fiber optic customers demonstrate varied churn patterns
- **Support Services**: Online security and tech support impact retention

## Business Recommendations

### High-Risk Customer Management
1. **Immediate Intervention**: Customers with >70% churn probability require urgent attention
2. **Retention Incentives**: Targeted offers for month-to-month contract customers
3. **Service Upgrades**: Proactive enhancement recommendations for medium-risk customers

