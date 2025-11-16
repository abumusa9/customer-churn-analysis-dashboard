import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Users, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'
import './App.css'

const API_BASE_URL = '/api/churn'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<PredictionForm />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/customers" element={<CustomerList />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/predict', label: 'Predict Churn', icon: Activity },
    { path: '/analytics', label: 'Analytics', icon: PieChartIcon },
    { path: '/customers', label: 'Customers', icon: Users }
  ]

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Churn Analysis</h1>
          </div>
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!analytics) {
    return <div className="text-center text-red-500">Error loading dashboard data</div>
  }

  const { overview, demographics, business_metrics } = analytics

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Churn Analysis Dashboard</h1>
        <p className="text-lg text-gray-600">Comprehensive insights into customer retention and churn patterns</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_customers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churned Customers</CardTitle>
            <TrendingDown className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.churned_customers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overview.churn_rate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overview.retention_rate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Churn Rate by Income Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(demographics.income).map(([key, value]) => ({
                income: key,
                churnRate: (value.mean * 100).toFixed(1),
                customers: value.count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="income" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, 'Churn Rate']} />
                <Bar dataKey="churnRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Churn Rate by Contract Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(business_metrics.contract).map(([key, value]) => ({
                contract: key,
                churnRate: (value.mean * 100).toFixed(1),
                customers: value.count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="contract" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, 'Churn Rate']} />
                <Bar dataKey="churnRate" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Monthly Charges</CardTitle>
            <CardDescription>Comparison between churned and retained customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Churned Customers</span>
                <span className="text-lg font-bold text-red-600">
                  ${business_metrics.avg_monthly_charges.churned.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Retained Customers</span>
                <span className="text-lg font-bold text-green-600">
                  ${business_metrics.avg_monthly_charges.retained.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Tenure</CardTitle>
            <CardDescription>Customer tenure in months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Churned Customers</span>
                <span className="text-lg font-bold text-red-600">
                  {business_metrics.avg_tenure.churned.toFixed(1)} months
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Retained Customers</span>
                <span className="text-lg font-bold text-green-600">
                  {business_metrics.avg_tenure.retained.toFixed(1)} months
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PredictionForm() {
  const [formData, setFormData] = useState({
    Age: '',
    Gender: '',
    MaritalStatus: '',
    IncomeLevel: '',
    MonthlyCharges: '',
    Tenure: '',
    TotalCharges: '',
    Contract: '',
    InternetService: '',
    OnlineSecurity: '',
    TechSupport: '',
    PaymentMethod: ''
  })
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-calculate TotalCharges when MonthlyCharges or Tenure changes
    if (field === 'MonthlyCharges' || field === 'Tenure') {
      const monthly = field === 'MonthlyCharges' ? parseFloat(value) : parseFloat(formData.MonthlyCharges)
      const tenure = field === 'Tenure' ? parseFloat(value) : parseFloat(formData.Tenure)
      
      if (!isNaN(monthly) && !isNaN(tenure)) {
        setFormData(prev => ({
          ...prev,
          TotalCharges: (monthly * tenure).toString()
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      setPrediction(result)
    } catch (error) {
      console.error('Error making prediction:', error)
      setPrediction({ error: 'Failed to make prediction' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Churn Prediction</h1>
        <p className="text-lg text-gray-600">Enter customer details to predict churn probability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Fill in the customer details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.Age}
                    onChange={(e) => handleInputChange('Age', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.Gender} onValueChange={(value) => handleInputChange('Gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="marital">Marital Status</Label>
                <Select value={formData.MaritalStatus} onValueChange={(value) => handleInputChange('MaritalStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="income">Income Level</Label>
                <Select value={formData.IncomeLevel} onValueChange={(value) => handleInputChange('IncomeLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly">Monthly Charges ($)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    step="0.01"
                    value={formData.MonthlyCharges}
                    onChange={(e) => handleInputChange('MonthlyCharges', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tenure">Tenure (months)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    value={formData.Tenure}
                    onChange={(e) => handleInputChange('Tenure', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="total">Total Charges ($)</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  value={formData.TotalCharges}
                  onChange={(e) => handleInputChange('TotalCharges', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contract">Contract Type</Label>
                <Select value={formData.Contract} onValueChange={(value) => handleInputChange('Contract', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Month-to-month">Month-to-month</SelectItem>
                    <SelectItem value="One year">One year</SelectItem>
                    <SelectItem value="Two year">Two year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="internet">Internet Service</Label>
                <Select value={formData.InternetService} onValueChange={(value) => handleInputChange('InternetService', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select internet service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DSL">DSL</SelectItem>
                    <SelectItem value="Fiber optic">Fiber optic</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="security">Online Security</Label>
                  <Select value={formData.OnlineSecurity} onValueChange={(value) => handleInputChange('OnlineSecurity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="support">Tech Support</Label>
                  <Select value={formData.TechSupport} onValueChange={(value) => handleInputChange('TechSupport', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={formData.PaymentMethod} onValueChange={(value) => handleInputChange('PaymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronic check">Electronic check</SelectItem>
                    <SelectItem value="Mailed check">Mailed check</SelectItem>
                    <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                    <SelectItem value="Credit card">Credit card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Predicting...' : 'Predict Churn'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {prediction && (
          <Card>
            <CardHeader>
              <CardTitle>Prediction Result</CardTitle>
            </CardHeader>
            <CardContent>
              {prediction.error ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{prediction.error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                      prediction.prediction === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {prediction.prediction === 1 ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      <span className="font-semibold">
                        {prediction.prediction === 1 ? 'Likely to Churn' : 'Likely to Stay'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Churn Probability</span>
                        <span className="text-lg font-bold">{(prediction.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            prediction.probability > 0.7 ? 'bg-red-500' : 
                            prediction.probability > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${prediction.probability * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Risk Level: </span>
                      <Badge variant={
                        prediction.risk_level === 'High' ? 'destructive' :
                        prediction.risk_level === 'Medium' ? 'default' : 'secondary'
                      }>
                        {prediction.risk_level}
                      </Badge>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {prediction.risk_level === 'High' && (
                          <>
                            <li>• Immediate intervention required</li>
                            <li>• Consider offering retention incentives</li>
                            <li>• Schedule personal consultation</li>
                          </>
                        )}
                        {prediction.risk_level === 'Medium' && (
                          <>
                            <li>• Monitor customer satisfaction</li>
                            <li>• Proactive customer engagement</li>
                            <li>• Consider service upgrades</li>
                          </>
                        )}
                        {prediction.risk_level === 'Low' && (
                          <>
                            <li>• Customer is likely satisfied</li>
                            <li>• Continue current service level</li>
                            <li>• Consider upselling opportunities</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Analytics() {
  const [featureImportance, setFeatureImportance] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [analyticsRes, featureRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics`),
        fetch(`${API_BASE_URL}/feature-importance`)
      ])
      
      const analyticsData = await analyticsRes.json()
      const featureData = await featureRes.json()
      
      setAnalytics(analyticsData)
      setFeatureImportance(featureData.feature_importance)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics</h1>
        <p className="text-lg text-gray-600">Deep insights into customer behavior and churn patterns</p>
      </div>

      {featureImportance && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <CardDescription>Factors that most influence customer churn</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={featureImportance.slice(0, 10)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={100} />
                <Tooltip formatter={(value) => [value.toFixed(4), 'Importance']} />
                <Bar dataKey="importance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Churn by Age Group</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics.demographics.age_group).map(([key, value]) => ({
                  ageGroup: key,
                  churnRate: (value.mean * 100).toFixed(1),
                  customers: value.count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`${value}%`, 'Churn Rate']} />
                  <Bar dataKey="churnRate" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.demographics.gender).map(([key, value]) => ({
                      name: key === 'M' ? 'Male' : 'Female',
                      value: value.count,
                      churnRate: (value.mean * 100).toFixed(1)
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, churnRate }) => `${name}: ${value} (${churnRate}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#0088FE" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCustomers()
  }, [page])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers?page=${page}&per_page=20`)
      const data = await response.json()
      setCustomers(data.customers)
      setTotalPages(data.total_pages)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading customers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Database</h1>
        <p className="text-lg text-gray-600">Browse and analyze individual customer records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Records</CardTitle>
          <CardDescription>Page {page} of {totalPages}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Age</th>
                  <th className="text-left p-2">Gender</th>
                  <th className="text-left p-2">Income</th>
                  <th className="text-left p-2">Tenure</th>
                  <th className="text-left p-2">Monthly</th>
                  <th className="text-left p-2">Contract</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.CustomerID} className="border-b hover:bg-gray-50">
                    <td className="p-2">{customer.CustomerID}</td>
                    <td className="p-2">{customer.Age}</td>
                    <td className="p-2">{customer.Gender}</td>
                    <td className="p-2">{customer.IncomeLevel}</td>
                    <td className="p-2">{customer.Tenure}m</td>
                    <td className="p-2">${customer.MonthlyCharges?.toFixed(2)}</td>
                    <td className="p-2">{customer.Contract}</td>
                    <td className="p-2">
                      <Badge variant={customer.Churn === 1 ? 'destructive' : 'secondary'}>
                        {customer.Churn === 1 ? 'Churned' : 'Active'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App

