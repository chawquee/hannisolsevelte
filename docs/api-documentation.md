# API Documentation - Hannisol Solana Address Checker

## Overview
The Hannisol Solana Address Checker API provides comprehensive validation, analysis, and tracking for Solana blockchain addresses. This RESTful API is built with SvelteKit and supports both public address checking and protected admin functionalities.

## Base URL
```
https://hannisol.com/api
```

## Authentication
- **Public Routes**: No authentication required
- **Admin Routes**: JWT token authentication required
- **Rate Limiting**: 100 requests per minute per IP for public routes, 1000 requests per minute for authenticated admin routes

## API Endpoints

### 🔍 Public Address Search API

#### POST /api/search
Check and analyze a Solana address with comprehensive validation and risk assessment.

**Request Body:**
```json
{
  "address": "5DF4D...3RcB3gf3Z",
  "clientIP": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "region": "US"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "validation": {
      "isValid": true,
      "format": "Base58",
      "length": 44,
      "type": "Nonce Account",
      "status": "Valid"
    },
    "balance": {
      "sol": 1.25,
      "solUSD": 24.75,
      "tokens": 3,
      "nfts": 0,
      "totalValueUSD": 45.60
    },
    "transactions": {
      "total": 158,
      "firstActivity": "2021-08-31T00:00:00Z",
      "lastActivity": "2024-12-30T00:00:00Z",
      "recent": [
        {
          "signature": "5DF4D...3RcB3gf3Z",
          "type": "Transfer",
          "amount": 0.1,
          "timestamp": "2024-12-30T10:00:00Z"
        }
      ]
    },
    "riskAnalysis": {
      "overallScore": 65,
      "riskLevel": "Medium",
      "factors": {
        "liquidityLocked": true,
        "ownershipRenounced": false,
        "mintAuthority": "Active",
        "freezeAuthority": "Disabled"
      },
      "rugPullRisk": {
        "score": 65,
        "level": "Medium",
        "volume24h": 1200000
      }
    },
    "community": {
      "size": 15200,
      "engagement": "High",
      "growth": 12,
      "sentiment": "Positive",
      "metrics": {
        "likes": 4800,
        "comments": 2300,
        "shares": 1700
      }
    },
    "security": {
      "riskLevel": "Medium",
      "knownScam": false,
      "suspiciousActivity": false
    },
    "searchId": "search_123456789"
  },
  "timestamp": "2024-12-30T12:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "The provided address is not a valid Solana address",
    "details": "Address must be 44 characters in Base58 format"
  },
  "timestamp": "2024-12-30T12:00:00Z"
}
```

### 📊 Analytics API

#### GET /api/analytics
Get basic analytics data for public consumption.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSearches": 45623,
    "uniqueAddresses": 12450,
    "averageRiskScore": 72,
    "popularAddresses": [
      {
        "address": "5DF4D...truncated",
        "searchCount": 234,
        "riskScore": 65
      }
    ]
  }
}
```

### 🔗 Sharing API

#### POST /api/share
Generate a shareable link for search results.

**Request Body:**
```json
{
  "searchId": "search_123456789",
  "shareType": "twitter" // twitter, telegram, discord, direct
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shareUrl": "https://hannisol.com/share/abc123def456",
    "expiresAt": "2025-01-30T12:00:00Z",
    "socialText": "Check this Solana address analysis on Hannisol: Trust Score 78/100 ⚡"
  }
}
```

#### GET /api/share/{shareId}
Retrieve shared search results.

**Response:**
```json
{
  "success": true,
  "data": {
    "searchResults": { /* Same structure as /api/search response */ },
    "sharedAt": "2024-12-30T12:00:00Z",
    "expiresAt": "2025-01-30T12:00:00Z"
  }
}
```

## 🔐 Admin API Routes

### Authentication

#### POST /api/admin/auth/login
Admin authentication endpoint.

**Request Body:**
```json
{
  "username": "admin",
  "password": "secure_password",
  "twoFactorToken": "123456" // Optional if 2FA enabled
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

#### POST /api/admin/auth/refresh
Refresh authentication token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expiresIn": 3600
  }
}
```

### Dashboard Analytics

#### GET /api/admin/analytics/dashboard
Get comprehensive dashboard analytics.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `timeframe`: hour, day, week, month, year
- `startDate`: ISO 8601 date string
- `endDate`: ISO 8601 date string

**Response:**
```json
{
  "success": true,
  "data": {
    "traffic": {
      "totalVisitors": 12450,
      "uniqueVisitors": 8230,
      "pageViews": 45623,
      "bounceRate": 0.32,
      "avgSessionDuration": 185
    },
    "revenue": {
      "totalRevenue": 234.56,
      "adsenseRevenue": 156.78,
      "affiliateRevenue": 77.78,
      "adNetworkBreakdown": {
        "adsense": 156.78,
        "coinzilla": 45.67,
        "aAds": 23.45,
        "mediaNet": 8.66
      }
    },
    "searches": {
      "totalSearches": 8450,
      "uniqueAddresses": 3420,
      "averageRiskScore": 68.5,
      "riskDistribution": {
        "low": 2340,
        "medium": 4560,
        "high": 1550
      }
    },
    "geographic": {
      "topCountries": [
        {"country": "US", "visitors": 3450, "revenue": 78.90},
        {"country": "UK", "visitors": 1230, "revenue": 34.56}
      ]
    },
    "performance": {
      "avgLoadTime": 1.2,
      "apiLatency": 450,
      "uptime": 99.98
    }
  }
}
```

### Revenue Tracking

#### GET /api/admin/revenue
Get detailed revenue analytics.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "todayRevenue": 12.45,
      "yesterdayRevenue": 18.67,
      "monthRevenue": 456.78,
      "yearRevenue": 2345.67
    },
    "adNetworks": [
      {
        "network": "Google AdSense",
        "revenue": 156.78,
        "impressions": 45670,
        "clicks": 234,
        "ctr": 0.51,
        "cpm": 3.44
      }
    ],
    "affiliatePrograms": [
      {
        "program": "Ledger Affiliate",
        "revenue": 77.78,
        "clicks": 156,
        "conversions": 3,
        "conversionRate": 1.92
      }
    ],
    "trends": {
      "dailyRevenue": [
        {"date": "2024-12-29", "revenue": 18.67},
        {"date": "2024-12-30", "revenue": 12.45}
      ]
    }
  }
}
```

### IP Tracking & Geographic Analytics

#### GET /api/admin/ip-tracking
Get detailed IP and geographic analytics.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit`: Number of results (default: 100)
- `offset`: Pagination offset
- `country`: Filter by country code
- `timeframe`: hour, day, week, month

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUniqueIPs": 8450,
    "newVisitors": 1230,
    "returningVisitors": 7220,
    "topCountries": [
      {
        "country": "United States",
        "code": "US",
        "visitors": 3450,
        "searches": 8920,
        "revenue": 78.90,
        "avgSessionDuration": 195
      }
    ],
    "searchPatterns": [
      {
        "address": "5DF4D...truncated",
        "searchCount": 45,
        "uniqueIPs": 23,
        "countries": ["US", "UK", "CA"]
      }
    ],
    "recentSearches": [
      {
        "ip": "192.168.1.1",
        "country": "US",
        "region": "California",
        "address": "5DF4D...truncated",
        "timestamp": "2024-12-30T12:00:00Z",
        "riskScore": 65
      }
    ]
  }
}
```

### Search Management

#### GET /api/admin/searches
Get detailed search history and analytics.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit`: Number of results
- `offset`: Pagination offset
- `riskLevel`: low, medium, high
- `startDate`: Filter from date
- `endDate`: Filter to date

**Response:**
```json
{
  "success": true,
  "data": {
    "searches": [
      {
        "id": 12345,
        "address": "5DF4D...truncated",
        "ip": "192.168.1.1",
        "country": "US",
        "riskScore": 65,
        "riskLevel": "medium",
        "timestamp": "2024-12-30T12:00:00Z",
        "responseTime": 450
      }
    ],
    "pagination": {
      "total": 8450,
      "limit": 100,
      "offset": 0,
      "pages": 85
    },
    "summary": {
      "totalSearches": 8450,
      "avgRiskScore": 68.5,
      "avgResponseTime": 425
    }
  }
}
```

## Rate Limiting

### Public API Limits
- **Address Search**: 100 requests per hour per IP
- **Analytics**: 50 requests per hour per IP
- **Sharing**: 20 shares per hour per IP

### Admin API Limits
- **Dashboard**: 1000 requests per hour per token
- **Analytics**: 500 requests per hour per token

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_ADDRESS` | Solana address format is invalid |
| `ADDRESS_NOT_FOUND` | Address does not exist on blockchain |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `BLOCKCHAIN_ERROR` | Solana RPC error |
| `INTERNAL_ERROR` | Server error |
| `MAINTENANCE_MODE` | Service temporarily unavailable |

## Webhook Support

### Search Notifications
```json
{
  "event": "high_risk_search",
  "data": {
    "address": "5DF4D...truncated",
    "riskScore": 95,
    "riskLevel": "high",
    "ip": "192.168.1.1",
    "timestamp": "2024-12-30T12:00:00Z"
  }
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const HannisolAPI = require('@hannisol/api-client');

const client = new HannisolAPI({
  baseURL: 'https://hannisol.com/api',
  apiKey: 'your-api-key' // For admin routes
});

// Check address
const result = await client.search({
  address: '5DF4D...3RcB3gf3Z'
});

console.log(result.data.riskAnalysis);
```

### Python
```python
import requests

response = requests.post('https://hannisol.com/api/search', json={
    'address': '5DF4D...3RcB3gf3Z'
})

data = response.json()
print(f"Risk Score: {data['data']['riskAnalysis']['overallScore']}")
```

## Security

### HTTPS Required
All API endpoints require HTTPS. HTTP requests will be redirected to HTTPS.

### CORS Policy
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Request Validation
- All inputs are sanitized and validated
- SQL injection protection
- XSS prevention
- CSRF protection for admin routes

## Support

For API support and questions:
- **Email**: api@hannisol.com
- **Documentation**: https://hannisol.com/docs
- **Status Page**: https://status.hannisol.com