# Forge Todo App with Privacy-First Analytics

This project contains a Forge custom UI app written in React that displays in a Jira issue panel. This **analytics branch** demonstrates best-in-class implementation of privacy-aware analytics in Atlassian Forge applications.

**🔐 Privacy-First:** No PII or end-user data is transmitted from the frontend. All analytics are processed through Forge backend resolvers with proper egress permissions.

**📊 Event Tracking:** Comprehensive tracking of user interactions (CRUD operations, UI events) and automated daily group analytics.

**🏗️ Type-Safe Architecture:** Modular, maintainable analytics system with clear separation between frontend events, backend processing, and external API integration.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

![Todo app for Jira](./example.gif "Todo app for Jira")

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

### Register the app
- Register the app by running:
```
forge register
```

### Configure the environment
This app supports the following environment variables. It is recommended to set the variables in each environment
as you progress through your development process. Note that changing variables requires a redeploy.

See the [Forge documentation](https://developer.atlassian.com/platform/forge/environments-and-versions/#environment-variables) for more information on environment variables. 

See the [Forge CLI documentation](https://developer.atlassian.com/platform/forge/cli-reference/variables/) for more information on using variables.

#### `ANALYTICS_API_KEY`
Set the Accoil API key in the environment. This is available from your account in Accoil. For example in development:
```
forge variables set --environment development ANALYTICS_API_KEY <your_api_key>
```

#### `ANALYTICS_DEBUG`
Set this to `true` and no real calls will be made to Accoil, instead it will log lines like:
```
Running analytics in debug. The following payload would be sent to https://in.accoil.com/v1/users:
{"user_id":"xxxx","group_id":"xxxx","traits":{"name":"xxxx"},"api_key":"xxxx","timestamp":1749789914400}
```

Set or unset with
```
forge variables set --environment development ANALYTICS_DEBUG true
forge variables unset --environment development ANALYTICS_DEBUG
```

#### `ANALTYICS_USER_ID_OVERRIDE`
Set this to `true` to always send the group ID in place of user IDs. This is useful for reducing Monthly Tracked Users (MTU) costs by consolidating user identification at the instance level.

Set or unset with
```
forge variables set --environment development ANALTYICS_USER_ID_OVERRIDE true
forge variables unset --environment development ANALTYICS_USER_ID_OVERRIDE
```

## Analytics Architecture

This Forge app implements a comprehensive, privacy-aware analytics system that demonstrates best practices for Atlassian Forge applications. The analytics architecture follows Atlassian's privacy guidelines and ensures no PII or end-user data leaves the frontend.

### 🏗️ Architecture Overview

```
Frontend (React)
│
├── Analytics Events (static/spa/src/analytics/events.js)
│   └── trackTodoItemsLoaded()
│
└── Forge Bridge → Backend Resolvers
                   │
                   ├── Track Events (src/analytics/resolvers.js)
                   ├── Event Queue (src/analytics/events.js)
                   ├── Queue Consumer (src/analytics/consumer.js)
                   ├── Dispatcher (src/analytics/dispatcher.js)
                   └── Scheduled Jobs (src/analytics/schedule.js)
                      │
                      └── Accoil API (https://in.accoil.com)
```

### 📊 Event Types

The app tracks the following events automatically:

**Frontend Events:**
- `Todos Loaded` - When the app loads todo items from storage

**Backend Events (CRUD Operations):**
- `Todo Created` - When a new todo item is created
- `Todo Updated` - When a todo item is modified (checked/unchecked)
- `Todo Deleted` - When a single todo item is deleted
- `Todos Cleared` - When all todo items are deleted

**Scheduled Events:**
- Daily group analytics with license information and activity status

### 🔐 Privacy & Compliance

The analytics implementation adheres to Atlassian's privacy requirements:

- **No Frontend Egress:** All analytics requests originate from the backend
- **No PII Transmission:** Only uses Atlassian-generated IDs (`accountId`, `cloudId`)
- **No End User Data (EUD) Leakage:** By routing all events through the backend, we prevent:
  - User IP addresses from being logged (only Atlassian Forge server IPs are seen)
  - Browser referrer information that might contain sensitive URLs
  - Client-side data that could inadvertently include PII
  - URL parameters or fragments that might contain user information
- **Proper Permissions:** External fetch permissions explicitly defined in manifest
- **Category Compliance:** Analytics endpoints marked with `category: analytics` and `inScopeEUD: false`

### 🧩 Implementation Details

#### Frontend Integration

The frontend uses a simple event tracking pattern:

```javascript
import { trackTodoItemsLoaded } from "./analytics/events";

// Track when data is loaded
invoke('get-all').then((values) => {
  trackTodoItemsLoaded();
  setTodos(values);
});
```

#### Backend Processing

Backend events are automatically triggered on CRUD operations:

```javascript
// In src/index.js resolvers
resolver.define('create', async ({ payload, context }) => {
  await trackCreate(context);  // Analytics tracking
  // ... business logic
});
```

#### Event Queue System

The analytics system uses Forge Events for reliable delivery:

1. **Events are queued** using `@forge/events` Queue
2. **Consumer processes** events asynchronously via `analytics-consumer`
3. **Dispatcher handles** different event types (track, identify, group)
4. **HTTP requests** are sent to Accoil API with proper error handling

#### Identity Management

The system provides flexible identity resolution:

- **User ID:** Uses `context.accountId` by default
- **Group ID:** Uses `context.cloudId` for instance-level tracking  
- **Override Mode:** Can substitute group ID for user ID to reduce MTU costs

### 🛠️ Analytics Configuration

#### Debug Mode

Enable debug mode to test analytics without sending real data:

```bash
forge variables set --environment development ANALYTICS_DEBUG true
```

This will log payloads instead of sending HTTP requests:

```
Running analytics in debug. The following payload would be sent to https://in.accoil.com/v1/events:
{"user_id":"123","event":"Todo Created","api_key":"[REDACTED]","timestamp":1749789914400}
```

#### Cost Optimization

Use the user ID override to reduce Monthly Tracked Users:

```bash
forge variables set ANALTYICS_USER_ID_OVERRIDE true
```

This sends the `cloudId` as the user ID for all events, consolidating tracking at the instance level.

### 📁 File Structure

```
src/analytics/
├── events.js      # Backend event definitions (single source of truth)
├── resolvers.js   # Resolver functions for frontend-triggered events
├── dispatcher.js  # HTTP dispatch logic for Accoil API
├── consumer.js    # Queue consumer for processing events
├── schedule.js    # Scheduled job for daily group analytics
└── utils.js       # Utility functions for context processing

static/spa/src/analytics/
└── events.js      # Frontend event definitions (single source of truth)
```

### 🎯 Event Definition Strategy

The analytics system uses **centralized event definition files** to maintain consistency and discoverability:

**Backend Events** (`src/analytics/events.js`):
- Single source of truth for all backend analytics events
- Easy auditing - see every tracked event in one place
- Consistent naming conventions across the application
- Simple discovery - no hunting through business logic code

**Frontend Events** (`static/spa/src/analytics/events.js`):
- Centralized frontend event definitions  
- Mirror the backend pattern for consistency
- Clear separation between UI and backend tracking

**Event Naming Convention:**
All events follow the "Object Verb" format for consistency and clarity:
- ✅ "Todo Created" (not "Create Todo" or "Backend: Create")  
- ✅ "Todos Loaded" (not "Load Todos" or "Todo Items Loaded")
- ✅ "View Opened" (not "Open View" or "Page Viewed")

This approach ensures that adding, modifying, or auditing analytics events is straightforward and maintainable.

### 🔄 Data Flow Examples

#### Frontend Event Flow
```
User loads app → trackTodoItemsLoaded() → invoke('track-event') → 
Backend resolver → Event queue → Consumer → Dispatcher → Accoil API
                   ↑
              Privacy Barrier: Only Forge server IPs reach analytics provider
```

#### Backend Event Flow
```  
User creates todo → trackCreate(context) → Event queue → 
Consumer → Dispatcher → Accoil API
```

#### Scheduled Flow
```
Daily trigger → dailyGroupAnalytics() → Dispatcher → Accoil API
```

### 🧪 Testing Analytics

1. **Enable debug mode** to see payload logs without sending requests
2. **Check Forge logs** for analytics processing: `forge logs --tail`
3. **Verify queue processing** by monitoring consumer function execution
4. **Test scheduled jobs** by checking daily analytics execution

### 🎯 Extending Analytics

To add new events:

1. **Frontend events:** Add functions to `static/spa/src/analytics/events.js`
2. **Backend events:** Add functions to `src/analytics/events.js`
3. **Update dispatcher:** Add handling in `src/analytics/dispatcher.js`
4. **Register resolvers:** Add to `src/index.js` if needed

Example:
```javascript
// Add to src/analytics/events.js
export const trackCustomEvent = async (context, eventData) => {
    const events = [{
        type: "track", 
        userId: userIdFromContext(context),
        event: "Custom Event",
        properties: eventData
    }];
    await analyticsQueue.push(events);
}
```

### Frontend
- Change into the frontend directory by running:
```
cd ./static/spa
```

- Install your frontend dependencies by running:
```
npm install
```

- Build your frontend by running:
```
npm run build
```

### Deployment
For this section, ensure you have navigated back to the root of the repository.

- Install the forge dependencies by running:
```
npm install
```

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

## Support
See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.

## Contributions
Contributions are welcome! Please see CONTRIBUTING.md for details.

## License
Copyright (c) 2020 Atlassian and others. Apache 2.0 licensed, see LICENSE file.
