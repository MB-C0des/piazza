Piazza - Cloud SaaS Platform

A Twitter like social media platform built as a RESTful SaaS application with OAuth 2.0 authentication, MongoDB database, Docker containerisation and Kubernetes.


Core Functionality

Secure Authentication - JWT-based OAuth 2.0 implementation
Post Management - Create, read, and browse posts by topic
Social Interactions - Like, dislike and comment on posts
Expiration System - Posts automatically expire after set time
Topic Categories - Politics, Health, Sport and Tech
Analytics - Find most active posts per topic
History - Browse expired posts


Project Structure

piazza/
├── src/
│   ├── models/              # Database schemas
│   ├── middleware/          # Auth & validation
│   ├── routes/              # API routes
│   ├── controllers/         # Controllers
│   ├── config/              # Configuration
│   └── app.js               # Application entry
├── tests/                   # Test suite
├── kubernetes/              # K8s configs
├── .env                     # Environment vars
├── Dockerfile               # Container definition
├── docker-compose.yml       # Multi-container setup
└── package.json             # Dependencies


RESTful API design

MongoDB database
Input validation and sanitisation
Error handling and logging
Horizontal scaling with Kubernetes
Load balancing across 5 replicas
Health check endpoints
Docker containerisation

