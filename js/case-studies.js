/**
 * Case Study Database for Asna V A Portfolio
 * Strictly adheres to factual information and the 10-section case study format.
 */

const caseStudiesData = {
  "dubai-real-estate": {
    id: "dubai-real-estate",
    number: "01",
    title: "Dubai Real Estate Yield & Liquidity Analytics",
    categories: ["Data Analytics", "SQL", "Power BI", "Python"],
    categoryLabel: "Data Analytics / BI",
    techSummary: "MySQL • Python (Pandas) • Power BI",
    headline: "Analyzing 1.77M Dubai Land Department transactions to reveal submarket price growth and liquidity dynamics.",
    metrics: [
      { label: "Raw Records", val: "1.77M" },
      { label: "Clean Residential Sales", val: "162,770" },
      { label: "Districts Analyzed", val: "6 Key Areas" },
      { label: "Timeline Scope", val: "2023 – 2026" }
    ],
    sections: {
      problem: "Real estate investors in Dubai often struggle to distinguish between nominal capital appreciation and actual market liquidity (ease of exit). The objective was to investigate whether high-priced luxury districts offer superior market efficiency compared to high-volume mid-tier communities, and to track quarter-over-quarter (QoQ) price changes across residential submarkets.",
      dataset: "Official Dubai Land Department (DLD) open transaction dataset spanning 2023 to 2026, comprising over 1.77 Million raw transaction records including sales, mortgages, gifts, registrations, and cancellations across residential, commercial, and land classifications.",
      dataCleaning: "Handled extensive real-world data quality issues:\n• Standardized multi-format corrupted transaction dates and localized calendar anomalies into clean ISO-8601 timestamps.\n• Resolved government area naming inconsistencies, English/Arabic spelling mismatches, and overlapping master-community identifiers.\n• Filtered out commercial leases, off-plan non-sale registrations, and land parcels to isolate 162,770 verified residential secondary and direct sales.\n• Identified and treated price-per-square-foot outlier anomalies caused by erroneous square-meter conversions.",
      analysis: "Developed multi-tiered analytical models using MySQL CTEs and Python:\n• Calculated quarter-over-quarter price per sq ft movement using window functions LAG() and partitioned growth metrics.\n• Formulated a Transaction-Based Liquidity Score measuring transaction velocity, sales frequency, and turnover ratio.\n• Applied RANK() and DENSE_RANK() across 6 benchmark districts: Downtown Dubai, Dubai Marina, Business Bay, Jumeirah Village Circle (JVC), Palm Jumeirah, and Dubai Hills Estate.",
      codeSnippet: {
        language: "sql",
        title: "MySQL Window Function Analysis: QoQ Growth & District Liquidity Ranking",
        code: `-- Analyzing Quarterly Price per Sq Ft Growth & Transaction Rank
WITH QuarterlyDistrictMetrics AS (
    SELECT 
        district_name,
        YEAR(instance_date) AS txn_year,
        QUARTER(instance_date) AS txn_quarter,
        COUNT(transaction_id) AS total_sales,
        ROUND(AVG(actual_worth / NULLIF(meter_sale_price * 10.7639, 0)), 2) AS avg_price_sqft,
        ROUND(SUM(actual_worth), 2) AS total_volume_aed
    FROM dld_clean_transactions
    WHERE property_usage = 'Residential'
      AND transaction_group = 'Sales'
      AND instance_date BETWEEN '2023-01-01' AND '2026-03-31'
    GROUP BY district_name, YEAR(instance_date), QUARTER(instance_date)
),
QuarterlyGrowth AS (
    SELECT 
        district_name,
        txn_year,
        txn_quarter,
        total_sales,
        avg_price_sqft,
        LAG(avg_price_sqft, 1) OVER (
            PARTITION BY district_name 
            ORDER BY txn_year, txn_quarter
        ) AS prev_quarter_price_sqft,
        RANK() OVER (
            PARTITION BY txn_year, txn_quarter 
            ORDER BY total_sales DESC
        ) AS liquidity_rank
    FROM QuarterlyDistrictMetrics
)
SELECT 
    district_name,
    txn_year,
    txn_quarter,
    total_sales,
    avg_price_sqft,
    liquidity_rank,
    ROUND(((avg_price_sqft - prev_quarter_price_sqft) / prev_quarter_price_sqft) * 100, 2) AS qoq_growth_pct
FROM QuarterlyGrowth
ORDER BY txn_year DESC, txn_quarter DESC, liquidity_rank ASC;`
      },
      dashboard: "Constructed an interactive Power BI Executive Dashboard featuring:\n• Macro KPI cards: Total Clean Sales Volume, Median Sq Ft Price, Average Liquidity Index.\n• District comparison matrix linking capital appreciation with transaction liquidity scores.\n• Interactive slicers for District, Unit Type (Apartment vs Villa), and Year/Quarter.",
      keyFindings: "• Jumeirah Village Circle (JVC) emerged as the most liquid submarket across the entire 2023–2026 timeframe, maintaining #1 transaction volume despite mid-tier price-per-square-foot valuation.\n• High-end districts (Palm Jumeirah, Downtown Dubai) recorded the highest capital growth rates per square foot but exhibited noticeably longer turnover cycles and lower exit liquidity.\n• Business Bay demonstrated consistent dual-strength: strong quarterly price resilience paired with top-tier liquidity metrics for 1-bedroom apartments.",
      recommendations: "• For Yield & Velocity Investors: Recommend allocating capital to JVC and Business Bay mid-sized units where high liquidity ensures swift exit velocity and low void periods.\n• For Capital Preservation: Recommend Downtown Dubai and Palm Jumeirah for long-term equity growth, but hedge against slower liquidation horizons.\n• Operational Strategy: Real estate funds should utilize the transaction-based liquidity score alongside nominal yield to evaluate portfolio risk accurately.",
      technologies: ["MySQL", "Python", "Pandas", "Power BI", "DAX", "SQL CTEs", "Data Modeling"],
      githubUrl: "https://github.com/asna-v-a/dubai-real-estate-yield-analytics"
    }
  },

  "retail-rfm-churn": {
    id: "retail-rfm-churn",
    number: "02",
    title: "Retail Customer RFM & Churn Risk Segmentation",
    categories: ["Data Analytics", "SQL", "Power BI", "Python"],
    categoryLabel: "Customer Analytics",
    techSummary: "Python (Pandas) • MySQL • Power BI",
    headline: "Segmenting 4,312 customers across 400,000+ transactions to identify churn exposure and preserve $667K in high-value revenue.",
    metrics: [
      { label: "Transactions", val: "400,000+" },
      { label: "Unique Customers", val: "4,312" },
      { label: "At-Risk Champions", val: "216" },
      { label: "Identified Spend", val: "$667,000" }
    ],
    sections: {
      problem: "E-commerce customer retention costs significantly less than new acquisition. The business needed to understand customer value distribution, identify behavior shifts before customer abandonment, detect accounts at imminent risk of churning, and uncover structural anomalies that skewed customer lifetime calculations.",
      dataset: "Transactional retail dataset spanning 400,000+ purchases made by 4,312 distinct registered customers, capturing Invoice Number, Stock Code, Item Description, Quantity, Invoice Date, Unit Price, and Customer ID.",
      dataCleaning: "Addressed critical data-quality challenges during exploratory data analysis:\n• Handled negative quantities indicating order cancellations and returned merchandise by matching cancellation invoices with original purchases.\n• Handled missing Customer IDs without blindly dropping rows—separated registered account transactions from guest checkouts.\n• Uncovered a critical wholesale-customer skew: A small cluster of B2B bulk wholesale buyers generated massive order sizes that heavily distorted normal statistical quartiles for consumer RFM scoring. Segregated wholesale buyers from retail consumer scores to preserve scoring validity.",
      analysis: "Engineered a statistical RFM (Recency, Frequency, Monetary) scoring framework using Python (Pandas) and SQL:\n• Computed Recency (days since last purchase relative to analysis baseline), Frequency (distinct purchase days), and Monetary (total customer spend).\n• Applied statistical quintile/percentile binning to assign scores from 1 to 5 across each dimension.\n• Segmented customer cohorts into Champions, Loyal Customers, Potential Loyalists, At Risk, Hibernating, and Lost.",
      codeSnippet: {
        language: "python",
        title: "Python (Pandas): Data Preprocessing, Wholesale Separation & RFM Engine",
        code: `import pandas as pd
import numpy as np

# Load transactions and filter cancellations
df = pd.read_csv('ecommerce_transactions.csv')
df = df[df['CustomerID'].notnull()]
df = df[~df['InvoiceNo'].astype(str).str.startswith('C')]
df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])

# Flag wholesale skew (outlier purchase behaviors)
customer_totals = df.groupby('CustomerID').agg(
    total_spend=('TotalPrice', 'sum'),
    avg_qty_per_order=('Quantity', 'mean'),
    order_count=('InvoiceNo', 'nunique')
)
wholesale_threshold = customer_totals['avg_qty_per_order'].quantile(0.99)
wholesale_ids = customer_totals[customer_totals['avg_qty_per_order'] > wholesale_threshold].index

# Compute RFM for standard consumer retail base
consumer_df = df[~df['CustomerID'].isin(wholesale_ids)]
snapshot_date = consumer_df['InvoiceDate'].max() + pd.Timedelta(days=1)

rfm = consumer_df.groupby('CustomerID').agg({
    'InvoiceDate': lambda x: (snapshot_date - x.max()).days,
    'InvoiceNo': 'nunique',
    'TotalPrice': 'sum'
}).rename(columns={'InvoiceDate': 'Recency', 'InvoiceNo': 'Frequency', 'TotalPrice': 'Monetary'})

# Quintile scoring
rfm['R_Score'] = pd.qcut(rfm['Recency'], 5, labels=[5, 4, 3, 2, 1])
rfm['F_Score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5])
rfm['M_Score'] = pd.qcut(rfm['Monetary'], 5, labels=[1, 2, 3, 4, 5])

# Identify High-Value At-Risk Cohort (High Monetary & Frequency, Deteriorating Recency)
at_risk_high_value = rfm[(rfm['R_Score'].isin([1, 2])) & 
                         (rfm['F_Score'].isin([4, 5])) & 
                         (rfm['M_Score'].isin([4, 5]))]`
      },
      dashboard: "Built a Power BI Customer Intelligence Report:\n• Customer Segment Matrix: Visualizing total customer count vs share of total revenue.\n• Churn Risk Alert Table: Directly isolating the 216 high-value accounts at risk of defection.\n• Dynamic RFM Segment slicers allowing marketing teams to export prioritized customer email lists.",
      keyFindings: "• Identified 216 high-value at-risk customers accounting for $667,000 in historical spend who had not made a purchase in over 90 days.\n• The top 18% of customers (Champions & Loyalists) generated over 63% of total revenue.\n• Flagged that unaddressed wholesale buyer records were artificially inflating the top monetary quintile boundary by 340%, which would have misclassified high-value retail consumers as mid-tier.",
      recommendations: "• Immediate Win-Back Program: Deploy personalized re-engagement campaigns with dedicated customer-care incentives for the 216 at-risk accounts.\n• B2B vs B2C Split: Separate wholesale accounts into a dedicated key-account CRM workflow with custom volume discounts, keeping consumer loyalty programs focused.\n• Automated Trigger: Establish automated notifications in the reporting layer when a high-value customer exceeds 60 days of inactivity.",
      technologies: ["Python", "Pandas", "NumPy", "MySQL", "Power BI", "Data Cleaning", "RFM Modeling"],
      githubUrl: "https://github.com/asna-v-a/retail-rfm-churn-segmentation"
    }
  },

  "automated-insight-generator": {
    id: "automated-insight-generator",
    number: "03",
    title: "Automated Insight Generator",
    categories: ["AI Automation", "Python", "Analytics"],
    categoryLabel: "AI + Analytics Automation",
    techSummary: "Python • Gemini API • Streamlit",
    headline: "Connecting live SQL databases with Gemini API to generate reliable, hallucination-resistant executive summaries.",
    metrics: [
      { label: "Stress Tests", val: "6 Validation Suites" },
      { label: "Data Source", val: "Live SQL Database" },
      { label: "Interface", val: "Streamlit UI" },
      { label: "AI Engine", val: "Gemini 1.5 Flash" }
    ],
    sections: {
      problem: "Business executives frequently need high-level summaries of fresh metrics, but manually drafting reports from SQL queries takes hours every week. The challenge was to automate executive insight generation from live databases while strictly preventing LLM hallucinations, ensuring reliable data extraction, and providing graceful error handling during API rate limits or network disruptions.",
      dataset: "Connected directly to relational business databases (sales, inventory, and marketing KPI tables), dynamically extracting aggregated quarterly performance metrics, trend deltas, and outlier data points.",
      dataCleaning: "Implemented rigorous pre-LLM data verification:\n• Sanitized and structured SQL query payloads into deterministic JSON schemas prior to model prompting.\n• Implemented threshold checks on numerical inputs to reject negative inventory or corrupted null timestamps.\n• Enforced deterministic format parsing to guarantee zero hallucinated data fields in the final output.",
      analysis: "Engineered an AI-powered analytics workflow:\n• Built a dynamic SQL query execution layer in Python that pulls live KPI metrics.\n• Applied strict prompt engineering techniques (role definition, zero-shot guardrails, grounded metric constraints, and structured JSON output rules).\n• Conducted six systematic stress tests covering edge cases: empty query results, schema shifts, hallucination-resistance under ambiguity, API rate-limit exponential backoff, token boundary limits, and unexpected database disconnects.",
      codeSnippet: {
        language: "python",
        title: "Python & Gemini API: Grounded Executive Summary Generation with Guardrails",
        code: `import os
import json
import google.generativeai as genai
import pandas as pd

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def generate_grounded_executive_insight(kpi_data: dict) -> str:
    """
    Generates a concise, strictly grounded executive summary from live KPI data.
    Ensures zero hallucination by enforcing strict constraint prompts.
    """
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        generation_config={
            "temperature": 0.2,  # Low temperature for factual precision
            "top_p": 0.8
        }
    )
    
    prompt = f"""
    You are an Executive Business Data Analyst.
    Analyze the following verified business KPI metrics extracted from the production database:
    {json.dumps(kpi_data, indent=2)}

    STRICT CONSTRAINTS:
    1. Only mention numbers and trends that are explicitly present in the provided JSON.
    2. Do NOT extrapolate, speculate, or invent any outside statistics.
    3. Structure your response into:
       - 1 Executive Bullet Summary (max 2 sentences)
       - 3 Key Performance Drivers
       - 1 Recommended Operational Action
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error executing insight generation: {str(e)}"`
      },
      dashboard: "Developed an interactive Streamlit application:\n• Live Database Connection status panel with one-click refresh.\n• Side-by-side view: Raw aggregated SQL table on the left, AI-generated executive summary on the right.\n• Stress-test simulator panel testing error recovery and rate-limit fallbacks in real-time.",
      keyFindings: "• Validated 100% adherence to source data across all six stress test suites with zero hallucinated figures at temperature 0.2.\n• Reduced recurring weekly executive briefing drafting time by over 80% while retaining full analyst oversight.\n• Successfully implemented retry logic with exponential backoff, preventing application crashes during transient API rate limits.",
      recommendations: "• Human-in-the-Loop Workflow: Position AI automation as an analyst accelerator where the analyst reviews generated summaries before executive dissemination.\n• Extensible Integrations: Connect the workflow to automated Slack or email webhooks for scheduled morning KPI digests.\n• Continuous Monitoring: Periodically run the 6-point stress testing suite whenever underlying database schemas evolve.",
      technologies: ["Python", "Streamlit", "Gemini API", "Prompt Engineering", "SQL Integration", "JSON Schema Validation"],
      githubUrl: "https://github.com/asna-v-a/ai-insight-generator"
    }
  }
};
